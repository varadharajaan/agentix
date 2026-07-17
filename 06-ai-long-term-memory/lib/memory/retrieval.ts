import { embed, cosineSimilarity } from "ai";
import { openai } from "@ai-sdk/openai";
import { listMemoriesWithEmbeddings } from "./store";
import type { Memory } from "./types";

const EMBEDDING_MODEL = process.env.MEMORY_EMBEDDING_MODEL ?? "text-embedding-3-small";
const MIN_SIMILARITY = 0.15;

/**
 * Phase 3: retrieve relevant memories.
 *
 * Embeds the incoming message and ranks every stored memory by cosine
 * similarity, returning only the ones above a minimum relevance threshold.
 * This keeps the system prompt small and on-topic instead of dumping every
 * memory into every request.
 */
export async function retrieveRelevantMemories(
  query: string,
  userId: string,
  limit = 6
): Promise<Memory[]> {
  const rows = listMemoriesWithEmbeddings(userId);
  if (rows.length === 0) return [];

  const { embedding: queryEmbedding } = await embed({
    model: openai.textEmbeddingModel(EMBEDDING_MODEL),
    value: query,
  });

  return rows
    .filter((r): r is { memory: Memory; embedding: number[] } => r.embedding !== null)
    .map((r) => ({ memory: r.memory, score: cosineSimilarity(queryEmbedding, r.embedding) }))
    .filter((r) => r.score > MIN_SIMILARITY)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.memory);
}
