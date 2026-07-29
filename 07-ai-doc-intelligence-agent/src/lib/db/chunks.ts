import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import type { ChunkRecord, EmbeddingRecord } from "@/lib/types";

interface ChunkRow {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  page_number: number | null;
  token_count: number | null;
  created_at: string;
}

function rowToChunk(row: ChunkRow): ChunkRecord {
  return {
    id: row.id,
    documentId: row.document_id,
    chunkIndex: row.chunk_index,
    content: row.content,
    pageNumber: row.page_number,
    tokenCount: row.token_count,
    createdAt: row.created_at,
  };
}

export function insertChunks(
  documentId: string,
  chunks: { content: string; pageNumber?: number | null; tokenCount?: number | null }[]
): ChunkRecord[] {
  const insert = db.prepare(
    `INSERT INTO chunks (id, document_id, chunk_index, content, page_number, token_count)
     VALUES (@id, @documentId, @chunkIndex, @content, @pageNumber, @tokenCount)`
  );

  const insertMany = db.transaction((rows: ChunkRecord[]) => {
    for (const row of rows) {
      insert.run({
        id: row.id,
        documentId: row.documentId,
        chunkIndex: row.chunkIndex,
        content: row.content,
        pageNumber: row.pageNumber,
        tokenCount: row.tokenCount,
      });
    }
  });

  const records: ChunkRecord[] = chunks.map((c, i) => ({
    id: randomUUID(),
    documentId,
    chunkIndex: i,
    content: c.content,
    pageNumber: c.pageNumber ?? null,
    tokenCount: c.tokenCount ?? null,
    createdAt: new Date().toISOString(),
  }));

  insertMany(records);
  return records;
}

export function getChunksForDocument(documentId: string): ChunkRecord[] {
  const rows = db
    .prepare(`SELECT * FROM chunks WHERE document_id = ? ORDER BY chunk_index ASC`)
    .all(documentId) as ChunkRow[];
  return rows.map(rowToChunk);
}

export function insertEmbedding(
  chunkId: string,
  vector: number[],
  model = "text-embedding-3-small"
): EmbeddingRecord {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO embeddings (id, chunk_id, model, dimensions, vector)
     VALUES (@id, @chunkId, @model, @dimensions, @vector)`
  ).run({
    id,
    chunkId,
    model,
    dimensions: vector.length,
    vector: JSON.stringify(vector),
  });

  return { id, chunkId, model, dimensions: vector.length, vector, createdAt: new Date().toISOString() };
}

// Returns every chunk + embedding + parent document, joined, for
// in-memory cosine-similarity search. Fine at prototype scale (thousands
// of chunks); swap for a vector DB if the corpus grows much larger.
export function getAllChunksWithEmbeddings(): {
  chunk: ChunkRecord;
  vector: number[];
  documentId: string;
}[] {
  const rows = db
    .prepare(
      `SELECT c.id as chunk_id, c.document_id, c.chunk_index, c.content, c.page_number,
              c.token_count, c.created_at, e.vector
       FROM chunks c
       JOIN embeddings e ON e.chunk_id = c.id`
    )
    .all() as (ChunkRow & { chunk_id: string; vector: string })[];

  return rows.map((row) => ({
    chunk: rowToChunk({
      id: row.chunk_id,
      document_id: row.document_id,
      chunk_index: row.chunk_index,
      content: row.content,
      page_number: row.page_number,
      token_count: row.token_count,
      created_at: row.created_at,
    }),
    vector: JSON.parse(row.vector),
    documentId: row.document_id,
  }));
}
