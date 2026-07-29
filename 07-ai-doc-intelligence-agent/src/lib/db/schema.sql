-- Document Intelligence Agent — SQLite schema
-- Storage for documents, chunks, embeddings, and conversations.
-- Embeddings are stored as JSON-encoded float arrays; semantic search is
-- performed in TypeScript via cosine similarity (see lib/ai/similarity.ts),
-- which keeps the project free of a separate vector database.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- One row per uploaded file.
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,           -- pdf | docx | txt | md | csv | json | png | jpeg
  mime_type TEXT,
  size_bytes INTEGER NOT NULL,
  page_count INTEGER,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | processing | ready | error
  error_message TEXT,
  raw_text TEXT,                     -- full extracted text (post-clean)
  metadata TEXT,                     -- JSON blob: {author, createdAt, ...}
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Chunks produced by the document processing pipeline.
CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER,
  token_count INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);

-- One embedding vector per chunk. Kept in its own table so alternate
-- embedding models/dimensions can coexist if ever needed.
CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  chunk_id TEXT NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  dimensions INTEGER NOT NULL,
  vector TEXT NOT NULL,              -- JSON-encoded number[]
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_embeddings_chunk_id ON embeddings(chunk_id);

-- Chat conversations (each maps to one LangGraph thread).
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                -- user | assistant | system
  content TEXT NOT NULL,
  citations TEXT,                    -- JSON blob: [{documentId, filename, page, chunkId}]
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Cached results for extraction / comparison / report jobs, keyed by the
-- documents involved, so repeated requests don't re-run the LLM.
CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                -- summary | extraction | comparison | report
  document_ids TEXT NOT NULL,        -- JSON array of document ids
  input TEXT,                        -- JSON blob: the request/schema used
  result TEXT NOT NULL,              -- JSON blob: the produced output
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
