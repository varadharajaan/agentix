# Document Intelligence Agent

An AI agent that understands, searches, compares, and extracts structured
information from uploaded documents — built with Next.js 16, LangGraph, and
GPT-5.5. Fully TypeScript, no Python/FastAPI involved.

## Documentation

For a deeper overview of the product, architecture, development workflow, project
structure, and API routes, see the [docs](docs/) folder. Start with
[docs/README.md](docs/README.md).

## Stack

- **App**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui
- **AI orchestration**: LangChain · LangGraph
- **Model**: OpenAI GPT-5.5 (chat) · `text-embedding-3-small` (embeddings)
- **Storage**: SQLite via `better-sqlite3` — documents, chunks, embeddings,
  conversations. Semantic search is plain cosine similarity computed in
  TypeScript (see `src/lib/ai/similarity.ts`), so there's no separate vector
  database to run.

## Getting started

```bash
npm install
cp .env.example .env.local   # add your OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000. The SQLite database is created automatically at
`data/app.db` on first run.

## Project structure

```
src/
  app/
    page.tsx                    # Dashboard shell
    api/
      documents/                # Upload, list, delete documents
      chat/                     # LangGraph-backed Q&A
      compare/                  # Multi-document comparison
      extract/                  # Structured extraction (JSON schema output)
      reports/                  # Executive summaries / detailed reports
      conversations/[id]/messages/
  components/
    ui/                         # Hand-rolled shadcn/ui primitives
    document-intelligence/      # Dashboard, uploader, chat, workbench tabs
  lib/
    db/                         # SQLite connection + typed repositories
    processing/                 # Extract → clean → chunk → pipeline
    ai/                         # OpenAI client, embeddings, cosine search
    graph/                      # LangGraph state, nodes, compiled workflow
    types.ts                    # Shared domain types
data/
  app.db                        # SQLite database (git-ignored)
```

## How a document becomes searchable

```
Upload → Detect file type → Extract text → Clean → Chunk
  → Embed each chunk (text-embedding-3-small) → Store in SQLite → Ready
```

Supported today: **PDF, DOCX, TXT, Markdown, CSV, JSON**.
Image/OCR support (`png`/`jpeg`) is stubbed in `src/lib/processing/extract.ts`
— wire in an OCR step there to complete the bonus phase.

## How a question gets answered

The LangGraph workflow in `src/lib/graph/workflow.ts`:

```
Question → Understand Intent → Retrieve Documents (cosine similarity)
  → Generate Response (GPT-5.5, grounded in retrieved chunks) → Answer + Citations
```

Intent (`qa | comparison | summary | extraction | search`) changes both the
retrieval breadth and the system prompt's instructions. Every answer's
sources are attached as citations and rendered as chips in the chat UI.

## API routes

| Route | Purpose |
|---|---|
| `POST /api/documents` | Upload one or more files, kicks off processing |
| `GET /api/documents` | List all documents + status |
| `GET/DELETE /api/documents/[id]` | Fetch or remove a document |
| `POST /api/chat` | Ask a question (LangGraph workflow) |
| `GET /api/conversations/[id]/messages` | Conversation history |
| `POST /api/compare` | Compare 2+ documents |
| `POST /api/extract` | Structured JSON extraction from one document |
| `POST /api/reports` | Executive summary or detailed report across documents |

## Notes on the shadcn/ui setup

The shadcn CLI fetches its registry from `ui.shadcn.com`; in some sandboxed
environments that network call isn't available. The components under
`src/components/ui/` are the standard MIT-licensed shadcn source, written by
hand against the same Radix primitives — functionally identical to what
`npx shadcn add` would produce. If you have full network access locally, you
can still use the CLI as normal (`npx shadcn@latest add <component>`) to add
more components; `components.json` is already configured for that.

## Roadmap / where to extend

- [ ] OCR for scanned PDFs and image uploads
- [ ] Streaming chat responses (swap `chat.completions.create` for
      `chat.completions.stream` + a streaming API route)
- [ ] Auth + per-user document scoping
- [ ] Swap the in-memory cosine search for a vector index if the corpus
      grows large enough that a full scan gets slow
