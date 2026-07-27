import { nanoid } from "nanoid";
import { db, embeddingToBlob, transaction } from "./db";
import { extractRepository } from "./ingest";
import { chunkFile } from "./chunker";
import { embedTexts } from "./embeddings";

/**
 * Runs the full ingestion pipeline for one uploaded ZIP:
 *   extract -> read source files -> chunk -> embed -> store in SQLite.
 * The repository row is created up front in "indexing" status so the UI can
 * show progress, then flipped to "ready" (or "error") when done.
 */
export async function ingestRepository(repoName: string, zipBuffer: Buffer) {
  const repoId = nanoid(10);

  db.prepare(
    `INSERT INTO repositories (id, name, status) VALUES (?, ?, 'indexing')`
  ).run(repoId, repoName);

  try {
    const files = await extractRepository(zipBuffer);

    if (files.length === 0) {
      throw new Error(
        "No recognizable source files found in this archive. Check that it isn't just node_modules/build output."
      );
    }

    const insertFile = db.prepare(
      `INSERT INTO files (id, repo_id, path, language, lines, size_bytes, content)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const fileIds: { id: string; path: string; language: string }[] = [];
    transaction(() => {
      for (const f of files) {
        const fileId = nanoid(10);
        insertFile.run(fileId, repoId, f.path, f.language, f.lines, f.sizeBytes, f.content);
        fileIds.push({ id: fileId, path: f.path, language: f.language });
      }
    });

    // Chunk every file.
    const allChunks: {
      fileId: string;
      path: string;
      language: string;
      startLine: number;
      endLine: number;
      content: string;
      symbol: string | null;
    }[] = [];

    for (let i = 0; i < files.length; i++) {
      const chunks = chunkFile(files[i]);
      for (const c of chunks) {
        allChunks.push({ fileId: fileIds[i].id, ...c });
      }
    }

    // Embed in batches (this is the slow, network-bound step).
    const vectors = await embedTexts(
      allChunks.map((c) => `File: ${c.path}\n\n${c.content}`)
    );

    const insertChunk = db.prepare(
      `INSERT INTO chunks (id, repo_id, file_id, path, language, start_line, end_line, symbol, content, embedding)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    transaction(() => {
      allChunks.forEach((c, idx) => {
        insertChunk.run(
          nanoid(12),
          repoId,
          c.fileId,
          c.path,
          c.language,
          c.startLine,
          c.endLine,
          c.symbol,
          c.content,
          embeddingToBlob(vectors[idx])
        );
      });
    });

    const totalLines = files.reduce((sum, f) => sum + f.lines, 0);

    db.prepare(
      `UPDATE repositories SET status = 'ready', file_count = ?, chunk_count = ?, total_lines = ? WHERE id = ?`
    ).run(files.length, allChunks.length, totalLines, repoId);

    return { repoId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown ingestion error";
    db.prepare(`UPDATE repositories SET status = 'error', error = ? WHERE id = ?`).run(
      message,
      repoId
    );
    throw err;
  }
}
