export interface Repository {
  id: string;
  name: string;
  fileCount: number;
  chunkCount: number;
  totalLines: number;
  status: "indexing" | "ready" | "error";
  createdAt: string;
  error?: string | null;
}

export interface RepoFile {
  id: string;
  repoId: string;
  path: string; // relative path inside the repo, e.g. src/lib/auth.ts
  language: string;
  lines: number;
  sizeBytes: number;
}

export interface CodeChunk {
  id: string;
  repoId: string;
  fileId: string;
  path: string;
  language: string;
  startLine: number;
  endLine: number;
  content: string;
  symbol?: string | null; // best-guess enclosing function/class name
}

export interface ChunkWithScore extends CodeChunk {
  score: number;
}

export interface ChatMessage {
  id: string;
  repoId: string;
  role: "user" | "assistant";
  content: string;
  sources?: { path: string; startLine: number; endLine: number; score?: number }[];
  createdAt: string;
}

export type AgentMode = "chat" | "docs" | "review" | "tests" | "architecture";

export interface IngestProgress {
  stage:
    | "extracting"
    | "reading"
    | "chunking"
    | "embedding"
    | "storing"
    | "done"
    | "error";
  filesProcessed?: number;
  totalFiles?: number;
  message?: string;
}
