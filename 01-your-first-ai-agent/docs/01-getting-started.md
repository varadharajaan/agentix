# Getting Started

## Prerequisites

- Node.js 20.9 or later
- npm
- An OpenAI-compatible API key

## Install and configure

```bash
npm install
copy .env.example .env.local
```

Edit `.env.local`:

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Server-side secret API key. |
| `OPENAI_MODEL` | No | Model ID; the code falls back to `gpt-5.5-mini`. |
| `OPENAI_BASE_URL` | No | Custom OpenAI-compatible base URL. |

The checked-in `.env.example` provides an OpenAI base URL and sample values. `.env.local` is local-only and should remain uncommitted.

## Run

```bash
npm run dev
```

Visit `http://localhost:3000`. Try a general question, `sqrt(144)`, or “What is the weather in Tokyo?”

## Validation and production

```bash
npm run lint
npm run build
npm run start
```

`build` creates and validates the production bundle; `start` serves it.

## Troubleshooting

| Issue | Action |
| --- | --- |
| Provider/model error | Verify API key, selected model, and optional base URL; restart the dev server after changing environment variables. |
| Weather failure | Retry with a specific place name; the Open-Meteo services may be unavailable. |
| No tool call | Ask a clearly arithmetic or weather-related question; tool selection is model-driven. |
| No streamed reply | Check the server terminal and confirm `/api/chat` is reachable. |
