import { getAllChunksWithEmbeddings } from "@/lib/db/chunks";
import { getDocument } from "@/lib/db/documents";
import { embedText } from "@/lib/ai/embeddings";
import type { RetrievedChunk } from "@/lib/types";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }

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

export interface SemanticSearchOptions {
  /** Restrict the search to specific documents (e.g. for comparisons). */
  documentIds?: string[];
  topK?: number;
  minScore?: number;
}

export async function semanticSearch(
  query: string,
  options: SemanticSearchOptions = {}
): Promise<RetrievedChunk[]> {
  const { documentIds, topK = 8, minScore = 0 } = options;

  const queryVector = await embedText(query);
  const rows = getAllChunksWithEmbeddings();

  const scored = rows
    .filter((r) => !documentIds || documentIds.includes(r.documentId))
    .map((r) => ({
      chunk: r.chunk,
      documentId: r.documentId,
      score: cosineSimilarity(queryVector, r.vector),
    }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const results: RetrievedChunk[] = [];
  const documentCache = new Map<string, ReturnType<typeof getDocument>>();

  for (const row of scored) {
    let document = documentCache.get(row.documentId);
    if (document === undefined) {
      document = getDocument(row.documentId);
      documentCache.set(row.documentId, document);
    }
    if (!document) continue;

    results.push({ chunk: row.chunk, document, score: row.score });
  }

  return results;
}
