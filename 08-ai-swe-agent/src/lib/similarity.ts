import { db, blobToEmbedding } from "./db";
import { embedQuery } from "./embeddings";
import { ChunkWithScore } from "./types";

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface ChunkRow {
  id: string;
  repo_id: string;
  file_id: string;
  path: string;
  language: string;
  start_line: number;
  end_line: number;
  symbol: string | null;
  content: string;
  embedding: Uint8Array;
}

/**
 * Semantic search: embeds the query, then scores it against every stored
 * chunk for the repo via cosine similarity computed directly in TypeScript.
 * No vector DB needed — fine for the chunk counts a single repo produces.
 */
export async function searchRepository(
  repoId: string,
  query: string,
  topK = 8,
  options?: { pathFilter?: string }
): Promise<ChunkWithScore[]> {
  const queryVec = new Float32Array(await embedQuery(query));

  let rows: ChunkRow[];
  if (options?.pathFilter) {
    rows = db
      .prepare(
        `SELECT id, repo_id, file_id, path, language, start_line, end_line, symbol, content, embedding
         FROM chunks WHERE repo_id = ? AND path LIKE ?`
      )
      .all(repoId, `%${options.pathFilter}%`) as ChunkRow[];
  } else {
    rows = db
      .prepare(
        `SELECT id, repo_id, file_id, path, language, start_line, end_line, symbol, content, embedding
         FROM chunks WHERE repo_id = ?`
      )
      .all(repoId) as ChunkRow[];
  }

  const scored: ChunkWithScore[] = rows.map((row) => ({
    id: row.id,
    repoId: row.repo_id,
    fileId: row.file_id,
    path: row.path,
    language: row.language,
    startLine: row.start_line,
    endLine: row.end_line,
    symbol: row.symbol,
    content: row.content,
    score: cosineSimilarity(queryVec, blobToEmbedding(row.embedding)),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
