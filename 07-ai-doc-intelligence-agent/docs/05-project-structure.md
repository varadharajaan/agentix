# Project Structure

The repository is organized around a small set of domain areas that map directly to the application's responsibilities.

## Root-level files

- package.json — scripts and dependency definitions
- tsconfig.json — TypeScript configuration
- next.config.ts — Next.js configuration
- components.json — shadcn/ui component configuration
- README.md — project overview and quick start

## Source tree

```text
src/
  app/
    page.tsx
    api/
      chat/
      compare/
      conversations/
      documents/
      extract/
      reports/
  components/
    ui/
    document-intelligence/
  lib/
    ai/
    db/
    graph/
    processing/
    types.ts
    utils.ts
    api-client.ts
```

## Important directories

### src/app

Contains route handlers and the main page entry point.

### src/components

Holds reusable UI components, including the dashboard and document workbench pieces.

### src/lib/ai

Contains OpenAI client setup, embeddings, and similarity helpers.

### src/lib/db

Contains the SQLite connection, schema logic, and repository-like helpers for entities.

### src/lib/graph

Contains the LangGraph workflow, state object, and node implementations.

### src/lib/processing

Contains the document extraction, cleaning, chunking, and pipeline orchestration code.

## Data directory

The data folder stores runtime artifacts such as the SQLite database file.

## Notes

This project keeps most of the complexity inside the lib layer so the UI and API routes stay focused on orchestration rather than implementation details.
