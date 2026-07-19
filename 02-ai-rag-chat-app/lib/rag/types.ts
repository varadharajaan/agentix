/**
 * Shared types for the RAG pipeline: document ingestion (store.ts,
 * ingest.ts, vectorstore.ts) and retrieval + generation (graph.ts).
 * IngestEvent and ChatEvent are the two NDJSON streaming protocols used by
 * /api/documents and /api/chat respectively.
 */

export type DocumentStatus = "processing" | "ready" | "error";

export interface RagDocument {
  id: string;
  title: string;
  filename: string;
  mimeType: string;
  status: DocumentStatus;
  chunkCount: number;
  errorMessage?: string;
  createdAt: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface RetrievedSource {
  index: number;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  snippet: string;
}

export type IngestEvent =
  | {
      type: "status";
      step: "extracting" | "chunking" | "embedding" | "storing";
      message: string;
    }
  | { type: "document"; document: RagDocument }
  | { type: "error"; message: string };

export type ChatEvent =
  | { type: "status"; step: "retrieving" | "generating"; message: string }
  | { type: "sources"; sources: RetrievedSource[] }
  | { type: "token"; text: string }
  | { type: "done"; answer: string }
  | { type: "error"; message: string };
