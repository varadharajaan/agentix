import { randomUUID } from "node:crypto";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import db from "@/lib/db";
import type { Confidence, Memory, MemoryType } from "./types";

const EMBEDDING_MODEL = process.env.MEMORY_EMBEDDING_MODEL ?? "text-embedding-3-small";

interface MemoryRow {
  id: string;
  user_id: string;
  type: MemoryType;
  content: string;
  confidence: Confidence;
  embedding: string | null;
  created_at: string;
  updated_at: string;
}

function toMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    content: row.content,
    confidence: row.confidence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function embedContent(content: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.textEmbeddingModel(EMBEDDING_MODEL),
    value: content,
  });
  return embedding;
}

/** Retrieve: list every memory for a user, most recently updated first. */
export function listMemories(userId: string): Memory[] {
  const rows = db
    .prepare("SELECT * FROM memories WHERE user_id = ? ORDER BY updated_at DESC")
    .all(userId) as MemoryRow[];
  return rows.map(toMemory);
}

/** Retrieve (internal): every memory plus its parsed embedding, for similarity search. */
export function listMemoriesWithEmbeddings(
  userId: string
): Array<{ memory: Memory; embedding: number[] | null }> {
  const rows = db
    .prepare("SELECT * FROM memories WHERE user_id = ?")
    .all(userId) as MemoryRow[];
  return rows.map((row) => ({
    memory: toMemory(row),
    embedding: row.embedding ? (JSON.parse(row.embedding) as number[]) : null,
  }));
}

/** Create: store a brand-new durable fact. */
export async function createMemory(
  input: { type: MemoryType; content: string; confidence?: Confidence },
  userId: string
): Promise<Memory> {
  const now = new Date().toISOString();
  const id = randomUUID();
  const confidence = input.confidence ?? "medium";
  const embedding = await embedContent(input.content);

  db.prepare(
    `INSERT INTO memories (id, user_id, type, content, confidence, embedding, created_at, updated_at)
     VALUES (@id, @userId, @type, @content, @confidence, @embedding, @now, @now)`
  ).run({
    id,
    userId,
    type: input.type,
    content: input.content,
    confidence,
    embedding: JSON.stringify(embedding),
    now,
  });

  return {
    id,
    userId,
    type: input.type,
    content: input.content,
    confidence,
    createdAt: now,
    updatedAt: now,
  };
}

/** Update: modify an existing memory (e.g. a preference that changed). */
export async function updateMemory(
  id: string,
  changes: { content?: string; confidence?: Confidence }
): Promise<Memory | null> {
  const row = db.prepare("SELECT * FROM memories WHERE id = ?").get(id) as
    | MemoryRow
    | undefined;
  if (!row) return null;

  const content = changes.content ?? row.content;
  const confidence = changes.confidence ?? row.confidence;
  const now = new Date().toISOString();
  const embeddingJson =
    changes.content && changes.content !== row.content
      ? JSON.stringify(await embedContent(content))
      : row.embedding;

  db.prepare(
    `UPDATE memories SET content = @content, confidence = @confidence, embedding = @embedding, updated_at = @now WHERE id = @id`
  ).run({ id, content, confidence, embedding: embeddingJson, now });

  return toMemory({ ...row, content, confidence, embedding: embeddingJson, updated_at: now });
}

/** Forget: permanently delete a memory. Returns the deleted row, if any. */
export function deleteMemory(id: string): Memory | null {
  const row = db.prepare("SELECT * FROM memories WHERE id = ?").get(id) as
    | MemoryRow
    | undefined;
  if (!row) return null;
  db.prepare("DELETE FROM memories WHERE id = ?").run(id);
  return toMemory(row);
}
