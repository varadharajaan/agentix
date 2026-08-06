# Project structure

This document explains the repository layout and the role of each important module.

## Top-level layout

```text
.
├── docs/                      # project documentation
├── data/                      # local runtime data, SQLite DB, extracted repos
├── public/                    # static assets (if added later)
├── src/
│   ├── app/                   # Next.js app router pages and API routes
│   ├── components/            # UI components for the dashboard
│   └── lib/                   # ingestion, embedding, retrieval, and agent logic
├── package.json               # dependencies and scripts
├── README.md                  # root project overview
└── tsconfig.json              # TypeScript configuration
```

## src/app

The src/app directory contains the web application entry points and route handlers.

### Pages

- src/app/page.tsx: the main landing page that shows repositories and the upload flow.

### API routes

- src/app/api/upload/route.ts: handles ZIP uploads and starts indexing.
- src/app/api/repos/route.ts: lists indexed repositories.
- src/app/api/repos/[id]/route.ts: fetches or deletes a single repository.
- src/app/api/repos/[id]/files/route.ts: lists files in a repository.
- src/app/api/repos/[id]/file/route.ts: returns the content of a file.
- src/app/api/search/route.ts: runs semantic retrieval.
- src/app/api/chat/route.ts: stores chat messages and answers questions.
- src/app/api/docs/route.ts: generates documentation.
- src/app/api/review/route.ts: reviews a file.
- src/app/api/tests/route.ts: generates tests.
- src/app/api/architecture/route.ts: explains system architecture.

## src/components

The components directory contains the UI building blocks.

- Dashboard.tsx: the main repository workspace layout.
- RepoUpload.tsx: the upload and ingestion entry point.
- ChatPanel.tsx: the chat UI and source citations.
- FileTree.tsx: file browsing.
- CodeViewer.tsx: monospace code display.
- SearchPanel.tsx: semantic search results and selection.
- AnalysisPanel.tsx: tabs for documentation, review, tests, and architecture.
- ui/: shared UI primitives such as buttons, cards, and tabs.

## src/lib

The lib folder is the engine of the app.

### Data and persistence

- db.ts: SQLite schema, database connection, and utility helpers for embeddings.

### Ingestion

- ingest.ts: ZIP extraction, filtering, and language detection.
- chunker.ts: chunking strategy for source files.
- pipeline.ts: orchestrates ingestion from ZIP to database.

### Embeddings and retrieval

- embeddings.ts: OpenAI embedding calls.
- similarity.ts: cosine similarity search over stored chunks.

### Agent workflow

- langgraph/state.ts: shared state shape for the agent workflow.
- langgraph/nodes.ts: request understanding, retrieval, context building, and response generation.
- langgraph/graph.ts: assembles the graph and runs the analysis workflow.

### Shared types

- types.ts: TypeScript interfaces for repositories, files, chunks, messages, and agent modes.

## data/

The data directory stores runtime artifacts:

- app.db: the SQLite database,
- repos/: extracted repository data.

This directory is intended to be local-only and is often gitignored in practical usage.

## How the pieces fit together

A new repository upload flows through the app in this order:

1. the UI posts a ZIP to the upload endpoint,
2. the ingest pipeline reads and chunks the repository,
3. embeddings are generated and stored,
4. the user interacts with the repository through the dashboard,
5. search and AI analysis retrieve relevant chunks from the database and generate responses.
