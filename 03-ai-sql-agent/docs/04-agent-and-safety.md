# Agent Workflow and Safety

## Agent workflow

The agent is built with LangChain `createAgent`, the configured `ChatOpenAI` model, a system prompt, and a tool set tied to the selected database file.

The system prompt directs the agent to:

1. List tables at the start of a conversation.
2. Inspect a table’s schema before referencing its columns.
3. Generate a valid SQLite `SELECT` query.
4. Execute the query.
5. Explain only the returned data in two to four sentences.

It also advises a default limit of five rows and permits up to two correction attempts after a query error.

## Tools

| Tool | Input | Result |
| --- | --- | --- |
| `list_tables` | None | Names and count of non-system tables. |
| `get_schema` | Table name | SQLite column metadata for one valid table. |
| `execute_sql` | SQL string | Validated SQL, rows, and row count—or an error. |

## Query safeguards

The implementation uses multiple protections, but it is still a learning project and should not be exposed to untrusted users without further hardening.

- Files are opened with `better-sqlite3` in **read-only** mode.
- `execute_sql` only accepts SQL beginning with `SELECT`.
- The validator removes one trailing semicolon and rejects multiple statements.
- It denies mutation and administration keywords including `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `REPLACE`, `TRUNCATE`, `ATTACH`, `DETACH`, `VACUUM`, and `PRAGMA`.
- Schema lookup checks that the table exists before issuing `PRAGMA table_info`.
- Uploads restrict file extensions and size.

## Security considerations

The current upload route stores files locally and queries them with a native SQLite library. A production deployment should add authentication and authorization, malware/file-format inspection, per-user isolated storage, upload quotas, query timeouts and row limits enforced by code, rate limiting, logging, and model-cost controls.
