# RAG Chat Application

This project is a local-document Retrieval-Augmented Generation (RAG) chat application. Users upload PDF, TXT, or Markdown files, then ask questions answered from retrieved excerpts rather than the model's general knowledge.

## What it does

1. Accepts a document upload.
2. Extracts text and splits it into overlapping chunks.
3. Creates OpenAI embeddings and persists chunks plus vectors in SQLite.
4. Retrieves the five most relevant chunks for each question.
5. Streams a grounded answer that cites excerpt numbers such as `[1]`.

## Main technologies

| Area | Technology |
| --- | --- |
| Web app | Next.js 16, React 19, TypeScript |
| Orchestration | LangGraph and LangChain |
| Models | `ChatOpenAI` and `OpenAIEmbeddings` |
| Vector retrieval | LangChain `MemoryVectorStore`, rehydrated from SQLite |
| Durable storage | `better-sqlite3` |
| Parsing | `pdf-parse` for PDFs; UTF-8 text for text/Markdown |
| UI | Tailwind CSS, shadcn-style components, Radix primitives |
| Streaming protocol | NDJSON over HTTP |

## Documentation map

| File | Description |
| --- | --- |
| [02-getting-started](./02-getting-started.md) | Local setup, configuration, and commands. |
| [03-architecture](./03-architecture.md) | System components and request flows. |
| [04-rag-pipeline](./04-rag-pipeline.md) | Ingestion, vector storage, retrieval, and generation. |
| [05-api-reference](./05-api-reference.md) | Document and chat endpoint contracts. |
| [06-project-structure](./06-project-structure.md) | File-by-file project map. |

## Current scope

The knowledge base is local to the server process and uses `data/rag.db`. Chat history lives only in browser state, so refresh clears the conversation. The app is designed for learning and local use; it does not include authentication, authorization, tenant isolation, upload-size controls, or production observability.
