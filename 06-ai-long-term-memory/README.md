# AI Memory Assistant

A personal AI assistant that remembers durable facts about you — preferences,
goals, projects, and constraints — across conversations, and shows exactly
what it remembers in a live memory panel next to the chat.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (button, card, badge, scroll-area,
  separator, textarea, skeleton)
- **AI SDK 7** (`ai` + `@ai-sdk/openai`) — chosen over LangChain, see below
- **better-sqlite3** for persistent storage (swap for Postgres easily — see
  "Swapping the database")
- **Zod** for structured tool-call schemas
- OpenAI models for chat, memory extraction (tool calling), and embeddings
  (`text-embedding-3-small`) for semantic retrieval

## Why AI SDK over LangChain

Both were listed as options. AI SDK fits this project better because the two
things this app actually needs — **structured tool calling** (the extraction
agent deciding to `remember` / `reviseMemory` / `forget`) and **token
streaming to the browser** (the chat reply, plus NDJSON progress events for
memory operations) — are exactly what `generateText`, `streamText`, and
`tool()` are built around, with a thin, typed surface and no extra
abstraction layer (chains, graphs, memory classes) to learn on top. LangChain
does ship its own memory abstractions, but they're general-purpose containers
for conversation history — they don't give you the create/update/forget
decision-making this project needs, so you'd still be writing that logic
yourself either way. Since the whole point of the project is to build and
understand that logic explicitly, plain AI SDK tool calls keep it visible in
one file (`lib/memory/extraction.ts`) instead of behind a framework
abstraction.

## Getting started

```bash
npm install
cp .env.example .env.local
# edit .env.local and set OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000. A local SQLite file is created automatically at
`data/memory.db` on first run — no separate database setup needed.

> **Note:** `better-sqlite3` is a native module. It ships prebuilt binaries
> for common platforms, so `npm install` usually just works, but if it fails
> to build on your machine you'll need Python + a C++ toolchain, or you can
> swap it for a hosted Postgres database (see below).

## How it works

```
User message
   │
   ▼
POST /api/chat
   │
   ├─ retrieveRelevantMemories()   lib/memory/retrieval.ts
   │    → embeds the message, ranks stored memories by cosine similarity,
   │      keeps only the ones above a relevance threshold
   │
   ├─ streamText() with the relevant memories woven into the system prompt
   │    → streamed back to the browser as plain text
   │
   ▼
Client calls POST /api/memories/extract with the completed turn
   │
   ▼
extractMemories()                 lib/memory/extraction.ts
   │
   └─ generateText() with three tools: remember / reviseMemory / forget
        → given the full existing memory list (with ids) so the model can
          update or delete instead of creating duplicates
        → each tool call writes to SQLite immediately and is streamed to
          the client as an NDJSON event, so the memory panel updates live
```

Memory is retrieved **before** the reply is generated and written **after**
it, matching the lifecycle described in the project brief. The chat model
and the memory-extraction model are deliberately separate calls — the chat
model only ever produces what the user sees, while the extraction model's
tool calls are the only thing allowed to touch the memory store.

## Project structure

```
app/
  api/
    chat/route.ts               Streams a personalized chat reply
    memories/route.ts           GET (list) + DELETE (manual forget)
    memories/extract/route.ts   Streams memory create/update/forget events
  page.tsx, layout.tsx, globals.css
components/
  memory-assistant.tsx          Two-pane dashboard layout
  memory-panel.tsx              Preferences / Goals / Projects / Constraints
  chat-panel.tsx, chat-message.tsx
  ui/                           shadcn primitives
hooks/
  use-memory-chat.ts            Orchestrates chat streaming + extraction
lib/
  db.ts                         SQLite connection + schema
  utils.ts                      cn() helper for shadcn components
  memory/
    types.ts                    Memory, MemoryEvent, etc.
    store.ts                    Create / Retrieve / Update / Forget
    retrieval.ts                Embedding-based semantic retrieval
    extraction.ts                The tool-calling memory-maintenance agent
```

## Mapping to the suggested build phases

| Phase | Where |
|---|---|
| 1. Store memories manually | `lib/memory/store.ts` (`createMemory`) + the manual delete button in the memory panel |
| 2. Automatically extract memories | `lib/memory/extraction.ts` |
| 3. Retrieve relevant memories | `lib/memory/retrieval.ts`, called from `app/api/chat/route.ts` |
| 4. Update existing memories | the `reviseMemory` tool in `extraction.ts` |
| 5. Forget outdated memories | the `forget` tool in `extraction.ts`, plus manual delete via `DELETE /api/memories` |
| 6. Memory management UI | `components/memory-panel.tsx` + the live NDJSON stream from `/api/memories/extract` |

## Swapping the database

Every function in `lib/memory/store.ts` takes a `userId` and talks to SQLite
through a handful of plain SQL statements — there's no ORM to fight. To move
to Postgres: replace `lib/db.ts` with a Postgres client (e.g. `pg` or a
Neon/Supabase client), keep the same `memories` table shape (add a real
`vector` column via `pgvector` if you want similarity search in the database
instead of in JS), and update the SQL in `store.ts` and `retrieval.ts`
accordingly. Because `userId` is already threaded through every function,
adding real multi-user auth is a matter of populating it from a session
instead of the hardcoded `"local-user"` constant used in the API routes.
