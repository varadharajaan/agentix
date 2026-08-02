# Project Structure

```text
02-ai-rag-chat-app/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Retrieval and answer streaming endpoint
│   │   └── documents/route.ts     # Document list, upload, and deletion API
│   ├── globals.css                # Theme and chat Markdown styles
│   ├── layout.tsx                 # Root metadata and font setup
│   └── page.tsx                   # Home page; mounts the dashboard
├── components/
│   ├── rag-dashboard.tsx          # Three-pane application composition
│   ├── document-sidebar.tsx       # Upload, progress, list, deletion
│   ├── chat-panel.tsx             # Chat input, suggestions, transcript
│   ├── chat-message.tsx           # User/assistant message rendering
│   ├── sources-panel.tsx          # Retrieved excerpt display
│   └── ui/                        # Reusable button, card, badge, scroll UI
├── data/
│   └── rag.db                     # Local SQLite documents/chunks/embeddings
├── docs/                          # Numbered project documentation
│   ├── 01-overview.md
│   ├── 02-getting-started.md
│   ├── 03-architecture.md
│   ├── 04-rag-pipeline.md
│   ├── 05-api-reference.md
│   └── 06-project-structure.md
├── hooks/
│   └── use-rag-chat.ts            # Client state and NDJSON consumption
├── lib/
│   ├── db.ts                      # SQLite initialization/schema
│   ├── utils.ts                   # className helper
│   └── rag/
│       ├── graph.ts               # LangGraph retrieve -> generate workflow
│       ├── ingest.ts              # Extraction, chunking, embeddings
│       ├── store.ts               # SQLite document/chunk queries
│       ├── types.ts               # Shared domain and stream-event types
│       └── vectorstore.ts         # Cached vector-store rehydration
├── types/pdf-parse.d.ts           # Parser type declaration
├── .env.example                   # Environment variable template
├── components.json                # UI component configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Scripts and dependencies
└── tsconfig.json                  # TypeScript settings and @/* alias
```

## Conventions

- Use `@/` for imports rooted at the project directory.
- Keep SQLite and RAG implementation server-only; corresponding routes specify `runtime = "nodejs"`.
- Keep the NDJSON event contracts centralized in `lib/rag/types.ts`.
- Do not edit installed `node_modules/` or generated SQLite WAL sidecar files directly.
