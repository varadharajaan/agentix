# API reference

All endpoints are implemented as Next.js route handlers under `src/app/api/`.

## `POST /api/session`

Creates an empty session and its backing directory.

### Response

```json
{ "sessionId": "uuid" }
```

## `POST /api/upload`

Uploads one or more files to an existing session.

### Form fields

| Field | Required | Description |
| --- | --- | --- |
| `sessionId` | Yes | Session identifier returned by `/api/session` |
| `files` | Yes | One or more files |

Files are limited to 25 MB each. Supported extensions are `.csv`, `.tsv`, `.xlsx`, `.xls`, `.json`, `.txt`, `.md`, `.png`, `.jpg`, `.jpeg`, `.gif`, and `.webp`.

### Response

```json
{
  "saved": ["sales.csv"],
  "rejected": [],
  "files": [{ "name": "sales.csv", "origin": "uploaded", "kind": "csv" }]
}
```

Filenames are flattened with `path.basename` and unsupported filename characters become underscores.

## `POST /api/chat`

Runs the AI agent for a user request.

### JSON body

```json
{
  "sessionId": "uuid",
  "prompt": "Analyze sales.csv and create a monthly-revenue chart.",
  "history": [
    { "role": "user", "content": "Previous request" },
    { "role": "assistant", "content": "Previous explanation" }
  ]
}
```

`history` is optional. It contains text-only previous turns; Python files in the same session remain available independently of history.

### Stream format

The response is `application/x-ndjson`. Each line is a JSON event:

```json
{ "type": "timeline", "timeline": [{ "id": "execute", "status": "active" }] }
{ "type": "result", "result": { "explanation": "...", "artifacts": [] } }
```

On an unexpected server failure, the final event may be:

```json
{ "type": "fatal", "error": "..." }
```

The agent result includes the final tool code/output, all execution attempts, timeline status, explanation, and artifacts changed by the run.

## `GET /api/files/:sessionId`

Returns the current files for a valid session:

```json
{ "files": [{ "name": "chart.png", "url": "/api/files/<id>/chart.png", "origin": "generated" }] }
```

## `GET /api/files/:sessionId/:filename`

Streams a file inline with an extension-based content type. Invalid session IDs and filename traversal attempts return 400; missing files return 404.
