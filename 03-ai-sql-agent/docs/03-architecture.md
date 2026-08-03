# Architecture

```text
Browser page
  DatabaseSidebar + query form + result panels
       |                         |
       | /api/databases           | /api/query
       v                         v
file manager                  query route
  list/save/resolve              validate question and database
       |                         |
       v                         v
SQLite files                  LangChain SQL agent
                                  |      |       |
                                  v      v       v
                            list tables schema  execute SQL
                                              (read-only SQLite)
```

## Client

`src/app/page.tsx` owns the selected database, current question, loading state, response, and upload state. It loads databases when the page mounts, posts uploads as `FormData`, and posts questions as JSON. The page renders the generated SQL, a tabular result set, and the explanation in separate panels.

`DatabaseSidebar` manages database selection and uploads. `InputPrompt` collects questions. The SQL, result, loading, and explanation components are presentation-focused and consume the response created by the query route.

## Server

`/api/databases` lists available database files and accepts a `file` upload. `/api/query` validates the question and selected database, builds an agent scoped to that database path, invokes it with the user’s question, and normalizes LangChain messages into a `QueryResponse`.

## Database access

`database-files.ts` governs which files may be listed, saved, and selected. `db.ts` opens the selected SQLite database in read-only mode. The three agent tools call helpers in this module to list tables, inspect schemas, and execute a validated SQL query.

## Response formatting

The agent may produce intermediate tool-call messages. `formatQueryResponse` finds the successful `execute_sql` result for SQL/rows/count and the final non-tool-call AI message for the explanation. This keeps internal agent operations out of the UI response.
