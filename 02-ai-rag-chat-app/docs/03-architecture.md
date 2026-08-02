# Architecture

```text
Browser
  RagDashboard + useRagChat
    |                         |
    | multipart NDJSON         | JSON / NDJSON
    v                         v
POST /api/documents        POST /api/chat
    |                         |
    v                         v
ingest pipeline            LangGraph: retrieve -> generate
    |                         |
    v                         v
SQLite chunks + vectors    MemoryVectorStore rehydrated from SQLite
```

## UI

`RagDashboard` composes three panes: document upload/management, the chat panel, and the retrieved-sources panel. `useRagChat` owns document state, messages, progress labels, errors, and NDJSON stream parsing. Assistant text is rendered as Markdown; sources from the latest assistant response are displayed separately.

## Server routes

- `/api/documents` manages document listing, upload/ingestion, and deletion.
- `/api/chat` validates a question, builds a fresh RAG graph, retrieves relevant chunks, and streams answer tokens.

Both routes declare the Node.js runtime because `better-sqlite3` uses a native binding. Upload may run for up to 300 seconds; chat for up to 120 seconds.

## Storage model

`lib/db.ts` initializes SQLite with `documents` and `chunks` tables. Every chunk stores its text and embedding as JSON. Deleting a document deletes its chunks through a foreign-key cascade. SQLite uses WAL mode and foreign keys are enabled.

## Caching

`vectorstore.ts` caches one in-memory LangChain `MemoryVectorStore` at module scope. It is rebuilt from ready SQLite chunks when first needed and invalidated after a successful ingestion or deletion. This avoids recomputing embeddings during retrieval while retaining persistence across process restarts.
