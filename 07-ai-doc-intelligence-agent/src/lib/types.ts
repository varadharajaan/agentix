export type DocumentType = "pdf" | "docx" | "txt" | "md" | "csv" | "json" | "png" | "jpeg";

export type DocumentStatus = "pending" | "processing" | "ready" | "error";

export interface DocumentRecord {
  id: string;
  filename: string;
  fileType: DocumentType;
  mimeType: string | null;
  sizeBytes: number;
  pageCount: number | null;
  status: DocumentStatus;
  errorMessage: string | null;
  rawText: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChunkRecord {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  pageNumber: number | null;
  tokenCount: number | null;
  createdAt: string;
}

export interface EmbeddingRecord {
  id: string;
  chunkId: string;
  model: string;
  dimensions: number;
  vector: number[];
  createdAt: string;
}

export interface Citation {
  documentId: string;
  filename: string;
  page: number | null;
  chunkId: string;
  snippet: string;
}

export interface ConversationRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface MessageRecord {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  citations: Citation[] | null;
  createdAt: string;
}

export interface RetrievedChunk {
  chunk: ChunkRecord;
  document: DocumentRecord;
  score: number;
}

export type ArtifactType = "summary" | "extraction" | "comparison" | "report";

export interface ArtifactRecord {
  id: string;
  type: ArtifactType;
  documentIds: string[];
  input: Record<string, unknown> | null;
  result: unknown;
  createdAt: string;
}
