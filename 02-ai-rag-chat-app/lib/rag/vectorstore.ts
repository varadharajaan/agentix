import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { Document } from "@langchain/core/documents";
import { listAllChunks } from "./store";

const EMBEDDING_MODEL =
  process.env.RAG_EMBEDDING_MODEL ?? "text-embedding-3-small";

let cachedStore: MemoryVectorStore | null = null;
let cachedEmbeddings: OpenAIEmbeddings | null = null;

function getEmbeddings(): OpenAIEmbeddings {
  if (!cachedEmbeddings) {
    cachedEmbeddings = new OpenAIEmbeddings({ model: EMBEDDING_MODEL });
  }
  return cachedEmbeddings;
}

/**
 * Embeddings are persisted durably in SQLite (lib/rag/store.ts) - that's
 * the actual "vector database" for this project. This module rehydrates
 * them into a real LangChain `VectorStore` (MemoryVectorStore) so retrieval
 * goes through LangChain's standard similarity-search / retriever
 * interface rather than hand-rolled search logic. The store is cached in
 * module scope and only rebuilt when ingestion or deletion invalidates it.
 */
export async function getVectorStore(): Promise<MemoryVectorStore> {
  if (cachedStore) return cachedStore;

  const store = new MemoryVectorStore(getEmbeddings());
  const rows = listAllChunks();

  if (rows.length > 0) {
    const documents: Document[] = rows.map((row) => ({
      pageContent: row.content,
      metadata: {
        chunkId: row.id,
        documentId: row.documentId,
        documentTitle: row.documentTitle,
        chunkIndex: row.chunkIndex,
      },
    }));
    const vectors = rows.map((row) => row.embedding);
    // addVectors skips re-embedding, since these embeddings were already
    // computed once during ingestion and persisted to SQLite.
    await store.addVectors(vectors, documents);
  }

  cachedStore = store;
  return store;
}

/** Call after ingesting or deleting a document so the next query rebuilds from SQLite. */
export function invalidateVectorStore(): void {
  cachedStore = null;
}

export { getEmbeddings };
