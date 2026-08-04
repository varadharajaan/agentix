# Architecture

## High-level flow

The application is organized around a simple loop:

1. A user sends a chat message.
2. The server retrieves relevant memories from the store.
3. The chat model generates a personalized response.
4. The completed exchange is sent to a memory extraction step.
5. The extraction layer decides whether to create, update, or forget memories.
6. The memory panel reflects those changes in real time.

## Main layers

### Frontend

The UI is built with Next.js App Router and React. The main experience is delivered through the chat and memory panels, with shared UI primitives from shadcn/ui.

### API routes

The app exposes routes for:

- Chat generation: app/api/chat/route.ts
- Memory listing and deletion: app/api/memories/route.ts
- Streaming memory extraction events: app/api/memories/extract/route.ts

### Memory system

The memory subsystem is split into three modules:

- store.ts: create, read, update, and delete memory records
- retrieval.ts: embed the latest message and find related memories by similarity
- extraction.ts: use an AI model with tools to decide what to remember or forget

### Persistence

Memories are stored in SQLite through better-sqlite3. Each memory includes content, type, confidence, embedding data, and timestamps.

## Request lifecycle

```text
User message
  -> chat API
  -> semantic retrieval
  -> model response
  -> memory extraction
  -> memory store update
  -> live UI update
```

## Design choices

- The chat model and memory extraction model are intentionally separate
- Retrieval happens before response generation
- Memory writes happen only through the extraction workflow and manual delete route
- The system is intentionally simple so it is easy to understand and adapt
