# AI Software Engineering Agent

An AI assistant that understands an entire software repository. Upload a
project as a `.zip`, and it's extracted, indexed, embedded, and made
searchable — so you can ask questions, generate docs, review code, and write
tests for a codebase you've never seen before, entirely from natural
language.

No GitHub auth, no OAuth, no external vector database. Everything runs
locally on top of SQLite and the OpenAI API.

## How it works

```
ZIP Repository → Extract → Read Source Files → Split into Chunks →
Generate Embeddings → SQLite Database
                                            │
User Question → Generate Query Embedding → Semantic Similarity Search →
Retrieve Relevant Chunks → GPT-5.5 (via a LangGraph workflow) → AI Explanation
```

- **Ingestion** (`src/lib/pipeline.ts`, `ingest.ts`, `chunker.ts`) — extracts
  the ZIP with JSZip, skips `node_modules`/`.git`/`dist`/build output, detects
  language by extension, and splits each file into overlapping chunks, trying
  to break on function/class boundaries where it can detect them.
- **Embeddings** (`src/lib/embeddings.ts`) — batches chunks through OpenAI's
  `text-embedding-3-small` and stores each vector as a BLOB in SQLite
  (`src/lib/db.ts`, using Node's built-in `node:sqlite` — no native module,
  nothing to compile).
- **Retrieval** (`src/lib/similarity.ts`) — cosine similarity computed
  directly in TypeScript over the stored vectors. No Pinecone/Chroma/pgvector
  needed for a single-repo, single-user tool like this.
- **Agent workflow** (`src/lib/langgraph/`) — a LangGraph `StateGraph` with
  five nodes: `understandRequest → searchAndRetrieve → analyzeContext →
  generateResponse`. The same graph powers chat, documentation generation,
  code review, test generation, and architecture explanations — only the
  final prompt differs per mode.
- **UI** (`src/components/`) — a developer-workspace dashboard: a file
  explorer + semantic search sidebar, a Monaco code viewer, an AI chat panel,
  and a bottom tab strip for Documentation / Reviews / Tests / Architecture.
  Every AI answer shows the exact file:line ranges it was grounded in, with a
  relevance meter — click one to jump straight to that code.

## Getting started

**Requirements:** Node.js 22.5+ (for built-in `node:sqlite` — check with
`node -v`), an OpenAI API key.

```bash
# 1. Install dependencies
npm install

# 2. Configure your API key
cp .env.example .env.local
# then edit .env.local and set OPENAI_API_KEY

# 3. Run it
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), drop in a `.zip` of any
project, and start asking questions once it finishes indexing.

> The database layer uses Node's built-in `node:sqlite` module rather than a
> native addon like `better-sqlite3` — no C++ toolchain, no prebuilt-binary
> version mismatches, nothing to compile. It just needs Node 22.5+ (unflagged
> since Node 23.4; if you're on an older Node, upgrade rather than downgrade
> this project).

## Project structure

```
src/
  app/
    page.tsx                 # repo picker / upload entry point
    api/
      upload/route.ts        # POST: extract + chunk + embed + store a ZIP
      repos/route.ts         # GET: list indexed repositories
      repos/[id]/route.ts    # GET/DELETE: one repository
      repos/[id]/files/      # GET: file list for the sidebar tree
      repos/[id]/file/       # GET: one file's content for the code viewer
      search/route.ts        # POST: raw semantic search (no LLM)
      chat/route.ts          # GET/POST: chat history + ask a question
      docs/route.ts          # POST: generate documentation
      review/route.ts        # POST: review a file
      tests/route.ts         # POST: generate unit tests for a file
      architecture/route.ts  # POST: explain the architecture
  components/                # dashboard, chat, file tree, code viewer, etc.
  lib/
    db.ts                    # SQLite schema + connection
    ingest.ts                # ZIP extraction + filtering + language detection
    chunker.ts                # code-aware chunk splitting
    embeddings.ts             # batched OpenAI embedding calls
    similarity.ts             # cosine similarity search
    pipeline.ts               # orchestrates ingest → chunk → embed → store
    langgraph/
      state.ts                # shared graph state
      nodes.ts                # the five workflow nodes
      graph.ts                # graph assembly + runAgent() entry point
```

## Documentation

A full documentation set is available in the [docs](docs/) folder:

- [docs/01-overview.md](docs/01-overview.md) — project overview and capabilities
- [docs/02-getting-started.md](docs/02-getting-started.md) — setup and local run instructions
- [docs/03-api-reference.md](docs/03-api-reference.md) — REST API endpoints
- [docs/04-architecture.md](docs/04-architecture.md) — system design and runtime flow
- [docs/05-project-structure.md](docs/05-project-structure.md) — source tree and module roles
- [docs/06-troubleshooting.md](docs/06-troubleshooting.md) — common issues and fixes

## Notes & limitations

- This is a local dev tool, not a multi-tenant SaaS — the SQLite DB and
  extracted repos live under `./data`, which is gitignored.
- Cosine similarity is computed by scanning every chunk in the repo per
  query. That's fine up to tens of thousands of chunks (a genuinely huge
  monorepo); if you outgrow that, swap `similarity.ts` for a real vector
  index without touching anything else — the interface (`searchRepository`)
  stays the same.
- The chunker's function/class boundary detection is regex-based, not a real
  parser, so it works well for C-family/JS/TS/Python/Go/Rust but will fall
  back to fixed-size windows for languages it doesn't recognize the shape of.
