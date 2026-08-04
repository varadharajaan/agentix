# Project Structure

## Top-level layout

```text
app/                Next.js App Router pages and API routes
components/         UI components for chat and memory panels
hooks/              Client-side orchestration hooks
data/               Runtime data and SQLite storage
lib/                Core logic for storage, retrieval, and extraction
```

## Important paths

- app/page.tsx: main app entry point
- app/api/chat/route.ts: chat generation endpoint
- app/api/memories/route.ts: memory listing and delete endpoint
- app/api/memories/extract/route.ts: NDJSON memory extraction stream
- components/memory-panel.tsx: memory management UI
- components/chat-panel.tsx: chat experience UI
- hooks/use-memory-chat.ts: front-end orchestration for chat and memory events
- lib/db.ts: database connection and schema
- lib/memory/store.ts: memory persistence layer
- lib/memory/retrieval.ts: semantic retrieval logic
- lib/memory/extraction.ts: tool-based memory extraction workflow

## Notes

The project intentionally keeps the implementation compact so the underlying memory architecture is easy to follow.
