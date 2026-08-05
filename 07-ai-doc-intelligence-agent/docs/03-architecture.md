# Architecture

This project follows a layered architecture that combines a Next.js frontend, API routes, a document processing pipeline, and a LangGraph-based reasoning flow.

## High-level layers

### 1. Presentation layer

The UI is implemented in the App Router under [src/app](../src/app) and the reusable interface components under [src/components](../src/components).

Responsibilities:

- Upload documents
- Display document status and list
- Show chat interfaces and conversation history
- Render generated answers and citations

### 2. API layer

The API routes in [src/app/api](../src/app/api) expose the application to the frontend and client integrations.

Main endpoints include:

- document upload and listing
- chat orchestration
- comparison jobs
- extraction jobs
- report generation

### 3. Processing layer

The processing pipeline in [src/lib/processing](../src/lib/processing) handles document ingestion.

Flow:

1. Detect the file type
2. Extract and clean text
3. Chunk content
4. Generate embeddings
5. Store chunks and vectors in SQLite

### 4. Retrieval and reasoning layer

The reasoning flow lives in [src/lib/graph](../src/lib/graph) and uses LangGraph.

The workflow performs:

- intent detection
- document retrieval from chunk embeddings
- answer generation grounded in retrieved evidence

## Storage model

The application uses SQLite via better-sqlite3. The schema in [src/lib/db/schema.sql](../src/lib/db/schema.sql) defines tables for:

- documents
- chunks
- embeddings
- conversations
- messages
- artifacts

## Retrieval strategy

Rather than relying on a separate vector database, the project computes cosine similarity in TypeScript using the embeddings stored in SQLite. This keeps the deployment simple while still enabling semantic search.

## Request flow example

A typical chat request follows this path:

1. The browser calls the chat API route.
2. The API creates or reuses a conversation record.
3. The LangGraph workflow classifies the user intent.
4. Relevant chunks are retrieved by similarity search.
5. The model produces an answer grounded in the returned excerpts.
6. Citations are saved to the message record and shown in the UI.
