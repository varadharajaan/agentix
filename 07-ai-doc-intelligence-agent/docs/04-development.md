# Development Guide

This document is intended for contributors who want to understand how to work on the project locally and extend it.

## Development workflow

### Install dependencies

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

### Lint the project

```bash
npm run lint
```

### Build the app

```bash
npm run build
```

## Recommended development areas

### Frontend work

Focus on:

- [src/components/document-intelligence](../src/components/document-intelligence)
- [src/app/page.tsx](../src/app/page.tsx)
- [src/app/layout.tsx](../src/app/layout.tsx)

### Backend and AI work

Focus on:

- [src/app/api](../src/app/api)
- [src/lib/graph](../src/lib/graph)
- [src/lib/processing](../src/lib/processing)

### Data and persistence

Focus on:

- [src/lib/db](../src/lib/db)
- [src/lib/types.ts](../src/lib/types.ts)

## Extension ideas

- Add OCR support for image and scanned PDF uploads.
- Implement streaming chat responses.
- Add authentication and per-user document scoping.
- Replace the in-memory similarity search with a dedicated vector store when the corpus grows.

## Code conventions

- Prefer TypeScript types over any/implicit any patterns.
- Keep API routes small and delegate heavy logic to the lib layer.
- Maintain the separation between data access, processing, and prompt orchestration.
- When adding new features, mirror the existing route and service organization for consistency.
