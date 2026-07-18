import { randomUUID } from "node:crypto";
import db from "@/lib/db";
import type { DocumentStatus, RagDocument } from "./types";

interface DocumentRow {
  id: string;
  title: string;
  filename: string;
  mime_type: string;
  status: DocumentStatus;
  chunk_count: number;
  error_message: string | null;
  created_at: string;
}

export interface ChunkWithEmbedding {
  id: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}

interface ChunkRow {
  id: string;
  document_id: string;
  document_title: string;
  chunk_index: number;
  content: string;
  embedding: string;
}

function toDocument(row: DocumentRow): RagDocument {
  return {
    id: row.id,
    title: row.title,
    filename: row.filename,
    mimeType: row.mime_type,
    status: row.status,
    chunkCount: row.chunk_count,
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at,
  };
}

/** Phase 1: create a document record before ingestion starts. */
export function createDocument(input: { title: string; filename: string; mimeType: string }): RagDocument {
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO documents (id, title, filename, mime_type, status, chunk_count, created_at)
     VALUES (@id, @title, @filename, @mimeType, 'processing', 0, @now)`
  ).run({ id, title: input.title, filename: input.filename, mimeType: input.mimeType, now });

  return {
    id,
    title: input.title,
    filename: input.filename,
    mimeType: input.mimeType,
    status: "processing",
    chunkCount: 0,
    createdAt: now,
  };
}

export function setDocumentStatus(
  id: string,
  status: DocumentStatus,
  extra?: { chunkCount?: number; errorMessage?: string }
): void {
  db.prepare(
    `UPDATE documents SET status = @status, chunk_count = COALESCE(@chunkCount, chunk_count), error_message = @errorMessage WHERE id = @id`
  ).run({
    id,
    status,
    chunkCount: extra?.chunkCount ?? null,
    errorMessage: extra?.errorMessage ?? null,
  });
}

export function listDocuments(): RagDocument[] {
  const rows = db
    .prepare("SELECT * FROM documents ORDER BY created_at DESC")
    .all() as DocumentRow[];
  return rows.map(toDocument);
}

export function getDocument(id: string): RagDocument | null {
  const row = db.prepare("SELECT * FROM documents WHERE id = ?").get(id) as
    | DocumentRow
    | undefined;
  return row ? toDocument(row) : null;
}

/** Deletes a document and its chunks (chunks cascade via the FK). */
export function deleteDocument(id: string): boolean {
  const result = db.prepare("DELETE FROM documents WHERE id = ?").run(id);
  return result.changes > 0;
}

/** Phase 4: store chunks with their precomputed embeddings. */
export function insertChunks(
  documentId: string,
  chunks: Array<{ content: string; embedding: number[] }>
): void {
  const now = new Date().toISOString();
  const insert = db.prepare(
    `INSERT INTO chunks (id, document_id, chunk_index, content, embedding, created_at)
     VALUES (@id, @documentId, @chunkIndex, @content, @embedding, @now)`
  );

  const insertMany = db.transaction((rows: typeof chunks) => {
    rows.forEach((chunk, index) => {
      insert.run({
        id: randomUUID(),
        documentId,
        chunkIndex: index,
        content: chunk.content,
        embedding: JSON.stringify(chunk.embedding),
        now,
      });
    });
  });

  insertMany(chunks);
}

/** Every chunk across every document, with its embedding parsed - used to rehydrate the in-memory vector store. */
export function listAllChunks(): ChunkWithEmbedding[] {
  const rows = db
    .prepare(
      `SELECT chunks.id, chunks.document_id, documents.title AS document_title,
              chunks.chunk_index, chunks.content, chunks.embedding
       FROM chunks
       JOIN documents ON documents.id = chunks.document_id
       WHERE documents.status = 'ready'
       ORDER BY chunks.document_id, chunks.chunk_index`
    )
    .all() as ChunkRow[];

  return rows.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    documentTitle: row.document_title,
    chunkIndex: row.chunk_index,
    content: row.content,
    embedding: JSON.parse(row.embedding) as number[],
  }));
}
