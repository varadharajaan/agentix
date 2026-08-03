# Getting Started

## Prerequisites

- Node.js 20.9 or newer
- npm
- An OpenAI API key available as `OPENAI_API_KEY`

## Install and configure

```bash
npm install
```

Create `.env.local` and set:

```env
OPENAI_API_KEY=your_api_key_here
```

The agent model is currently configured in `src/lib/ai/agent/model.ts` as `gpt-5.5`. API credentials must remain server-side and must not be committed.

## Run the app

```bash
npm run dev
```

Open `http://localhost:3000`. Choose the bundled `company.db` database or upload a SQLite database, then ask a question such as “Which five employees have the highest salary?”

## Commands

```bash
npm run lint
npm run build
npm run start
```

## Database files

The built-in database is `src/data/company.db`. Uploaded databases are written under `src/data/uploads/` with a timestamp-prefixed, sanitized filename. Uploads are restricted to `.db`, `.sqlite`, and `.sqlite3` and must be between 1 byte and 25 MB.

The database layer opens every selected file with `readonly: true`, so the app cannot modify uploaded or bundled database data through SQLite access.
