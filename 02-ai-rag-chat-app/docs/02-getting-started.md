# Getting Started

## Prerequisites

- Node.js 20.9 or newer
- npm
- An OpenAI API key with access to the selected chat and embedding models

## Install

```bash
npm install
copy .env.example .env.local
```

Configure `.env.local`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Server-side API key for generation and embeddings. |
| `RAG_CHAT_MODEL` | No | Chat model; defaults in code to `gpt-5.1`. |
| `RAG_EMBEDDING_MODEL` | No | Embedding model; defaults to `text-embedding-3-small`. |

The example environment file supplies model values but leaves the API key blank. Do not commit `.env.local`.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`, upload a PDF, TXT, or Markdown file, wait for it to become **ready**, then ask a question about it.

## Other commands

```bash
npm run lint
npm run build
npm run start
```

`dev` uses Turbopack. `build` validates the production application; `start` serves it after a successful build.

## Local data

SQLite data is stored in `data/rag.db`; SQLite WAL sidecar files may also appear in `data/`. Removing these files removes the local document metadata, text chunks, and stored embeddings. Do so only when intentionally resetting the knowledge base.

## Troubleshooting

| Problem | Suggested action |
| --- | --- |
| Upload fails | Confirm the file is PDF, TXT, or Markdown and that `OPENAI_API_KEY` is configured. |
| Document shows error | Inspect the displayed error and server terminal; scanned/image-only PDFs may contain no extractable text. |
| Chat fails | Confirm at least one ready document exists and verify the API key and selected model access. |
| Answers lack information | The relevant source may not have been uploaded or retrieved; ask a narrower question or improve the source content. |
