# Getting Started

Everything you need to run any project in this bundle. Each project is fully self-contained — there is no workspace-level install step.

---

## Prerequisites

| Requirement | Version | Needed for |
|-------------|---------|-----------|
| Node.js | 20.9+ | all projects |
| Node.js | 22.5+ | 08 (uses built-in `node:sqlite`) |
| npm (or pnpm/Bun) | any recent | all projects |
| OpenAI API key | — | all projects ([get one here](https://platform.openai.com/api-keys)) |
| Python 3 | 3.9+ | 04 only (agent executes Python locally) |

---

## Universal Setup (any project)

```bash
cd <project-folder>          # e.g. 02-ai-rag-chat-app
npm install
cp .env.example .env.local   # then edit .env.local and add your key
npm run dev                  # → http://localhost:3000
```

Other scripts in every project: `npm run build`, `npm run start`, `npm run lint`.

> **Note for 04 — AI Code Interpreter:** also install the Python dependencies:
>
> ```bash
> python3 -m pip install -r src/python-sandbox/requirements.txt
> ```

---

## Environment Variable Matrix

| Project | Required | Optional (defaults) |
|---------|----------|---------------------|
| 01 First AI Agent | `OPENAI_API_KEY` | `OPENAI_MODEL`, `OPENAI_BASE_URL` |
| 02 RAG Chat App | `OPENAI_API_KEY` | `RAG_CHAT_MODEL`, `RAG_EMBEDDING_MODEL` (`text-embedding-3-small`) |
| 03 SQL AI Agent | `OPENAI_API_KEY` | — (model configured in `src/lib/ai/agent/model.ts`) |
| 04 Code Interpreter | `OPENAI_API_KEY` | `OPENAI_MODEL`, `MAX_AGENT_RETRIES` (3), `PYTHON_EXEC_TIMEOUT_MS` (20000), `PYTHON_BIN`, `PYTHON_BIN_ARGS` |
| 05 Deep Research | `OPENAI_API_KEY` | `RESEARCH_MODEL` — must support the Responses API `web_search` tool |
| 06 Long-Term Memory | `OPENAI_API_KEY` | `MEMORY_MODEL`, `MEMORY_EMBEDDING_MODEL` (`text-embedding-3-small`) |
| 07 Doc Intelligence | `OPENAI_API_KEY` | `OPENAI_CHAT_MODEL` |
| 08 SWE Agent | `OPENAI_API_KEY` | `OPENAI_CHAT_MODEL`, `OPENAI_EMBEDDING_MODEL`, `DATA_DIR` (`./data`) |

`.env.example` files are committed with safe placeholder values — copy, don't create from scratch. Real `.env.local` files are git-ignored at both the project and bundle level.

---

## Per-Project Quick Reference

| # | Project | First thing to try |
|---|---------|--------------------|
| 01 | `01-your-first-ai-agent` | Ask *"What's the weather in Tokyo?"* or *"Calculate 18% tip on $86.40"* — watch the tool cards |
| 02 | `02-ai-rag-chat-app` | Drop a PDF into the sidebar, wait for "Ready", ask a question about it — check the Sources panel |
| 03 | `03-ai-sql-agent` | Use the bundled `company.db`; ask *"Which department has the highest average salary?"* |
| 04 | `04-ai-code-interpreter` | Upload a CSV, ask *"Plot the monthly trend and save it as a PNG"* — download the artifact |
| 05 | `05-ai-deep-research-assistant` | Ask a meaty question; watch plan → search → sources stream in, then export the report as `.md` |
| 06 | `06-ai-long-term-memory` | Say *"I'm learning Spanish and I prefer short answers"*, then ask about it in a later message |
| 07 | `07-ai-doc-intelligence-agent` | Upload two documents, run a Comparison, then try Extract with custom instructions |
| 08 | `08-ai-swe-agent` | Zip a small repo, upload it, then run Code Review and Architecture from the analysis tabs |

---

## Data & Storage

All runtime data is local and git-ignored:

- **SQLite files** (`data/*.db`) are created automatically on first run — 02, 06, 07 (project root `data/`), 08 (`DATA_DIR`).
- **03** ships a ready-to-query sample database at `src/data/company.db`; your uploads go to `src/data/uploads/` (ignored).
- **04** creates per-session workspaces under `data/sessions/` (ignored). There is no automatic cleanup — delete the folder any time to reclaim space.

To factory-reset any project, stop the dev server and delete its `data/` directory.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `OPENAI_API_KEY` / 500 errors on first request | Create `.env.local` (not `.env`) with a valid key, then **restart the dev server** |
| `better-sqlite3` build errors during install | Update Node to the latest LTS; on macOS ensure Xcode CLT is installed (`xcode-select --install`) |
| Project 08 crashes on boot | Node must be ≥ 22.5 for unflagged `node:sqlite` — check `node -v` |
| Project 04 can't run code | `python3` must be on PATH and `requirements.txt` installed; override with `PYTHON_BIN` if needed |
| Project 05 finds no sources | `RESEARCH_MODEL` must support OpenAI's hosted `web_search` tool |
| Model name errors (`gpt-5.x` not found) | Every model is configurable via the env vars above — set one your account has access to |
| Port already in use | `npm run dev -- -p 3001` |

If a project's behavior diverges from this guide, trust the project's own `docs/02-getting-started.md` — those files are maintained per project and are the most detailed source.
