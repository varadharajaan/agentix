# AI SQL Agent Overview

AI SQL Agent is an educational natural-language interface for SQLite databases. A user selects a bundled database or uploads a SQLite file, asks a question in plain English, and receives the generated read-only SQL statement, returned rows, and a concise explanation of the result.

## What happens when a question is asked

```text
Plain-English question + selected database
  -> API validation and database resolution
  -> LangChain SQL agent
  -> list tables -> inspect schema -> run SELECT query
  -> structured response: SQL, rows, row count, explanation
  -> browser panels render the analysis
```

## Technology stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16, React 19, TypeScript |
| AI runtime | LangChain `createAgent` and `ChatOpenAI` |
| Database access | `better-sqlite3` in read-only mode |
| Database type | SQLite (`.db`, `.sqlite`, `.sqlite3`) |
| Validation | Zod plus a SQL allow-list/deny-list validator |
| Interface | Tailwind CSS, Base UI, and custom React components |

## Documentation map

| File | Purpose |
| --- | --- |
| [02-getting-started](./02-getting-started.md) | Install, configure, run, and manage local database files. |
| [03-architecture](./03-architecture.md) | Client, API, agent, and database interaction. |
| [04-agent-and-safety](./04-agent-and-safety.md) | Tool workflow and read-only protections. |
| [05-api-reference](./05-api-reference.md) | Database and query endpoint contracts. |
| [06-project-structure](./06-project-structure.md) | Source-tree and responsibility map. |
