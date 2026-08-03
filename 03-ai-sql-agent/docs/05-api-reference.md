# API Reference

## `GET /api/databases`

Lists the bundled default database and valid files in `src/data/uploads/`.

Success response:

```json
{
  "success": true,
  "data": [{ "name": "company.db", "path": "…", "size": 1234, "isDefault": true }]
}
```

On failure, returns `500` with `{ "success": false, "error": "Unable to load databases." }`.

## `POST /api/databases`

Accepts `multipart/form-data` with a required `file` field. Valid files end in `.db`, `.sqlite`, or `.sqlite3` and are 1 byte to 25 MB.

Success response: `201` with `{ "success": true, "data": <database-file> }`.

Invalid/missing uploads return `400` with an error message.

## `POST /api/query`

Accepts JSON:

```json
{
  "question": "Which departments have the most employees?",
  "databaseName": "company.db"
}
```

`question` must be a non-empty string; `databaseName` must be a non-empty name from the available database list.

Success response:

```json
{
  "success": true,
  "data": {
    "sql": "SELECT department, COUNT(*) AS employee_count FROM employees GROUP BY department LIMIT 5",
    "rows": [{ "department": "Engineering", "employee_count": 12 }],
    "rowCount": 1,
    "explanation": "Engineering has the highest employee count in the returned results."
  }
}
```

Validation failures return `400`; agent/database failures return `500` with a generic user-facing error.
