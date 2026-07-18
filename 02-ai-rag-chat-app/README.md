# RAG Chat Application

Upload your own documents (PDF, TXT, Markdown) and ask questions that get
answered using retrieved excerpts from them — with sources shown, not just
asserted.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (button, card, badge, scroll-area,
  separator, textarea, skeleton)
- **LangChain.js v1** (`langchain`, `@langchain/core`, `@langchain/openai`,
  `@langchain/textsplitters`) for document loading, chunking, embeddings,
  and the vector store interface
- **LangGraph.js** (`@langchain/langgraph`) for the retrieve → generate
  pipeline
- **better-sqlite3** for persistent chunk + embedding storage
- **pdf-parse** for PDF text extraction
- **react-markdown** + **remark-gfm** for rendering answers
- OpenAI models for chat generation and embeddings (`text-embedding-3-small`)

## Getting started

```bash
npm install
cp .env.example .env.local
# edit .env.local and set OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000. A local SQLite file is created automatically at
`data/rag.db` on first run — no external vector database needed.

> **Note:** `better-sqlite3` is a native module. It ships prebuilt binaries
> for common platforms, so `npm install` usually just works. If it fails to
> build on your machine, you'll need Python + a C++ toolchain, or you can
> swap the storage layer for a hosted option — see "Swapping the vector
> store" below.

## How it works

### Ingestion (uploading a document)

```
POST /api/documents (multipart file)
   │
   ▼
ingestDocument()                    lib/rag/ingest.ts
   │
   ├─ extractText()                  pdf-parse for PDFs, plain UTF-8 otherwise
   ├─ RecursiveCharacterTextSplitter  @langchain/textsplitters — 1000 char
   │                                  chunks, 150 char overlap
   ├─ OpenAIEmbeddings.embedDocuments()   @langchain/openai
   └─ insertChunks()                 persists chunks + embeddings to SQLite
   │
   ▼
invalidateVectorStore()   so the next question rebuilds retrieval from the
                          freshly ingested chunks
```

Every stage emits progress over an NDJSON stream, which is how the sidebar
shows "Extracting… → Chunking… → Generating embeddings… → Storing…" live.

### Chat (asking a question) — the LangGraph part

```
POST /api/chat
   │
   ▼
buildRagGraph()                     lib/rag/graph.ts
   │
   StateGraph: START → retrieve → generate → END
   │
   ├─ retrieve(state)   → store.asRetriever({k: 5}).invoke(question)
   │                       (LangChain's standard retriever interface)
   │
   └─ generate(state)   → ChatOpenAI, given a system prompt built from the
                           retrieved excerpts (numbered, so the model can
                           cite them as [1], [2]...)
```

The API route drives the graph with `graph.stream(input, { streamMode:
"updates" })`, which yields each node's output as soon as that node
finishes. That's what lets the UI show retrieved sources *before* the
answer starts streaming rather than only at the very end. Token-level
streaming of the answer itself comes from a LangChain callback handler
(`handleLLMNewToken`) passed alongside `streamMode`, since `generate`'s
`ChatOpenAI` call has `streaming: true` — a well-established pattern that
doesn't depend on a specific LangGraph event-stream format.

### Vector storage

Embeddings are persisted durably in SQLite (`lib/rag/store.ts`) — that's the
actual database. `lib/rag/vectorstore.ts` rehydrates them into a real
LangChain `VectorStore` (`MemoryVectorStore`) on demand, cached in module
scope, and invalidated whenever a document is ingested or deleted. This
keeps retrieval going through LangChain's standard `VectorStore` /
`Retriever` interfaces (so swapping in Chroma, Pinecone, Qdrant, or pgvector
later is a small, contained change) without requiring an external vector
database service for this project.

## Project structure

```
app/
  api/
    documents/route.ts   GET (list) + POST (upload, streams ingestion) + DELETE
    chat/route.ts         POST — runs the LangGraph pipeline, streams NDJSON
  page.tsx, layout.tsx, globals.css
components/
  rag-dashboard.tsx        Two-pane dashboard layout
  document-sidebar.tsx     Upload button + document list with live status
  sources-panel.tsx        Retrieved chunks for the last answer
  chat-panel.tsx, chat-message.tsx (markdown-rendered assistant replies)
  ui/                      shadcn primitives
hooks/
  use-rag-chat.ts          Orchestrates upload progress + chat streaming
lib/
  db.ts                    SQLite connection + schema
  utils.ts                 cn() helper for shadcn components
  rag/
    types.ts                Shared types + the two NDJSON event protocols
    store.ts                Document + chunk persistence (Phases 1 & 4)
    ingest.ts               Extract → chunk → embed → store (Phases 1-4)
    vectorstore.ts           SQLite-backed LangChain VectorStore (Phase 4)
    graph.ts                 LangGraph retrieve/generate pipeline (Phases 5-6)
types/
  pdf-parse.d.ts            Ambient types (pdf-parse ships none)
```

## Mapping to the suggested build phases

| Phase | Where |
|---|---|
| 1. Upload and parse documents | `app/api/documents/route.ts` (POST) + `extractText()` in `ingest.ts` |
| 2. Chunk text | `RecursiveCharacterTextSplitter` in `ingest.ts` |
| 3. Generate embeddings | `OpenAIEmbeddings.embedDocuments()` in `ingest.ts` |
| 4. Store embeddings in a vector database | `store.insertChunks()` (SQLite) + `vectorstore.ts` (LangChain `VectorStore`) |
| 5. Retrieve relevant chunks | the `retrieve` node in `graph.ts` |
| 6. Generate grounded answers | the `generate` node in `graph.ts` |
| 7. Display sources + stream responses | `app/api/chat/route.ts` (NDJSON) + `sources-panel.tsx` + token streaming in `chat-message.tsx` |

## Swapping the vector store

Everything downstream of `getVectorStore()` in `lib/rag/vectorstore.ts` only
knows about LangChain's `VectorStore` interface — nothing else in the app
depends on `MemoryVectorStore` specifically. To move to a hosted vector
database (Chroma, Pinecone, Qdrant, or Postgres + pgvector), replace the
body of `getVectorStore()` with that provider's LangChain integration (e.g.
`PGVectorStore.initialize(...)`), and update `ingest.ts` to write to it
directly instead of to SQLite. `lib/rag/store.ts` can stay as-is for
tracking document metadata (title, status, chunk counts) even if chunk
content moves elsewhere.

## Known limitations / extension ideas

- **Citations are chunk-level, not page-level.** `pdf-parse` doesn't track
  page boundaries by default; for page-accurate citations, extract text
  page-by-page (`pdf-parse`'s `pagerender` option) and store a `page` field
  alongside each chunk.
- **Single-user, no auth.** There's no `userId` scoping on documents —
  every uploaded file is part of one shared knowledge base. Add a `userId`
  column to both tables in `lib/db.ts` to support multiple users.
- **The in-memory vector store rebuilds from SQLite on the first query
  after a server restart.** For a large knowledge base this adds latency
  to the first request; a real vector database wouldn't have this
  characteristic, which is part of why the README above calls out how to
  swap one in.
