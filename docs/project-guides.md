# Project Guides

Each project ships its own `docs/` folder with overview, architecture, API reference, and project-structure guides. This index maps every project to its documentation and the concepts it demonstrates.

The recommended study order is the numbered order — each project introduces concepts that later ones build on.

---

## 01 — Your First AI Agent

`01-your-first-ai-agent/` · [docs](01-your-first-ai-agent/docs/README.md)

A streaming chat agent with tool calling — the foundation everything else builds on.

- **Concepts:** ReAct agent loop, tool definition with Zod schemas, token streaming, LangChain ↔ AI SDK bridging, tool-call UI states
- **Read first:** [architecture](01-your-first-ai-agent/docs/02-architecture.md), then [agent and tools](01-your-first-ai-agent/docs/03-agent-and-tools.md)
- **Stack notes:** LangChain v1 `createAgent`, Vercel AI SDK `useChat`, Open-Meteo (keyless) + mathjs tools

## 02 — RAG Chat App

`02-ai-rag-chat-app/` · [docs](02-ai-rag-chat-app/docs/01-overview.md)

Retrieval-augmented chat over uploaded PDF/TXT/MD documents with numbered citations.

- **Concepts:** chunking (1000/150 overlap), OpenAI embeddings, persisting vectors in SQLite, rehydrated in-memory vector store, LangGraph `retrieve → generate`, NDJSON streaming, citation UX
- **Read first:** [architecture](02-ai-rag-chat-app/docs/03-architecture.md), then [RAG pipeline](02-ai-rag-chat-app/docs/04-rag-pipeline.md)
- **Stack notes:** LangChain v1 + LangGraph, `better-sqlite3`, `pdf-parse`

## 03 — SQL AI Agent

`03-ai-sql-agent/` · [docs](03-ai-sql-agent/docs/01-overview.md)

Natural-language querying of SQLite databases with generated SQL, results, and explanations.

- **Concepts:** schema-introspection tools (`list_tables`, `get_schema`, `execute_sql`), layered read-only safety (validator + driver-level `readonly`), errors-as-tool-results for self-correction, database upload handling
- **Read first:** [architecture](03-ai-sql-agent/docs/03-architecture.md), then [agent and safety](03-ai-sql-agent/docs/04-agent-and-safety.md)
- **Stack notes:** LangChain v1 `createAgent`, `better-sqlite3`, bundled sample `company.db`

## 04 — AI Code Interpreter

`04-ai-code-interpreter/` · [docs](04-ai-code-interpreter/docs/README.md)

An agent that writes and executes Python against uploaded files and returns generated artifacts.

- **Concepts:** tool-call interception (schema-only tools), per-session workspaces, process-level execution controls (`-I`, env scrubbing, timeouts), artifact detection via snapshot diffing, retry/recovery loops, live NDJSON timelines
- **Read first:** [architecture](04-ai-code-interpreter/docs/architecture.md), then [security and deployment](04-ai-code-interpreter/docs/security-and-deployment.md)
- **Stack notes:** LangChain tool loop, `child_process.spawn`, pandas/matplotlib sandbox deps

## 05 — Deep Research Assistant

`05-ai-deep-research-assistant/` · [docs](05-ai-deep-research-assistant/docs/README.md)

Autonomous multi-step web research that ends in a structured, cited markdown report.

- **Concepts:** plan → execute → synthesize, structured output planning (Zod), agentic `web_search` loops with step caps, global source dedup, server-numbered citations, progress event protocol
- **Read first:** [architecture](05-ai-deep-research-assistant/docs/03-architecture.md), then [development](05-ai-deep-research-assistant/docs/04-development.md)
- **Stack notes:** Vercel AI SDK 7, OpenAI Responses API `web_search`, no third-party search key needed

## 06 — Long-Term Memory Agent

`06-ai-long-term-memory/` · [docs](06-ai-long-term-memory/docs/01-overview.md)

A chat assistant with an explicit, inspectable long-term memory layer.

- **Concepts:** dual-call architecture (chat + extraction agent), memory CRUD via tools (`remember` / `reviseMemory` / `forget`), embedding-based semantic recall, confidence levels, live memory panel over NDJSON
- **Read first:** [architecture](06-ai-long-term-memory/docs/03-architecture.md), then [development notes](06-ai-long-term-memory/docs/06-development-notes.md)
- **Stack notes:** Vercel AI SDK 7, `better-sqlite3`, `text-embedding-3-small`

## 07 — Document Intelligence Agent

`07-ai-doc-intelligence-agent/` · [docs](07-ai-doc-intelligence-agent/docs/README.md)

Multi-document Q&A, comparison, structured extraction, and report generation.

- **Concepts:** multi-format parsing (PDF/DOCX/CSV/JSON), page-aware chunking, intent-routed LangGraph workflow, structured extraction via `zodResponseFormat`, evenly-sampled long-context reports, conversation persistence
- **Read first:** [architecture](07-ai-doc-intelligence-agent/docs/03-architecture.md), then [API reference](07-ai-doc-intelligence-agent/docs/06-api-reference.md)
- **Stack notes:** LangGraph + raw OpenAI SDK, `better-sqlite3`, `pdf-parse` v2, `mammoth`, `papaparse`

## 08 — Software Engineering Agent

`08-ai-swe-agent/` · [docs](08-ai-swe-agent/docs/README.md)

Repository-scale intelligence: upload a codebase ZIP, then search, chat, review, and generate docs/tests/architecture analyses.

- **Concepts:** symbol-aware code chunking, repo-scale RAG with float32 BLOB embeddings, multi-mode agent (chat/docs/review/tests/architecture), citation-to-editor UX (Monaco line highlighting), in-TS cosine search
- **Read first:** [architecture](08-ai-swe-agent/docs/04-architecture.md), then [API reference](08-ai-swe-agent/docs/03-api-reference.md)
- **Stack notes:** classic LangGraph 0.2 API, `node:sqlite` (Node ≥ 22.5), JSZip, Monaco editor

---

## Concept Coverage Matrix

| Concept | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 |
|---------|----|----|----|----|----|----|----|----|
| Tool calling | ● | | ● | ● | ● | ● | | |
| LangGraph state machines | | ● | | | | | ● | ● |
| RAG / embeddings | | ● | | | | ● | ● | ● |
| Streaming protocols | ● | ● | | ● | ● | ● | | |
| Structured output (Zod) | ● | | ● | ● | ● | ● | ● | |
| Safety / guardrails | | | ● | ● | | | | |
| Planning / multi-step agents | | | | ● | ● | | | ● |
| Persistence (SQLite / FS) | | ● | ● | ● | | ● | ● | ● |
| File upload pipelines | | ● | ● | ● | | | ● | ● |
| Citations / grounding | | ● | | | ● | | ● | ● |
