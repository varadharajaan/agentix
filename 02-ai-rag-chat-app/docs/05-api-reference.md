# API Reference

Both streaming endpoints return newline-delimited JSON (`application/x-ndjson`). Each line is one JSON event.

## `GET /api/documents`

Returns the document list:

```json
{ "documents": [{ "id": "…", "title": "handbook", "status": "ready", "chunkCount": 12 }] }
```

## `POST /api/documents`

Accepts `multipart/form-data` with a required `file` field. The UI accepts `.pdf`, `.txt`, `.md`, and `.markdown`.

Possible events:

| Event | Fields |
| --- | --- |
| `document` | Complete document metadata. Emitted initially and at completion. |
| `status` | `step`: `extracting`, `chunking`, `embedding`, or `storing`; plus a message. |
| `error` | A user-facing failure message. |

Error responses use JSON and include 400 for invalid form data/missing file and 500 when `OPENAI_API_KEY` is absent.

## `DELETE /api/documents?id=<id>`

Removes a document and its chunks. Returns `{ "deleted": true, "id": "…" }`; returns 400 without `id` and 404 for an unknown ID. The vector-store cache is invalidated.

## `POST /api/chat`

Request:

```json
{
  "question": "What is the refund policy?",
  "history": [{ "role": "user", "content": "Summarize the handbook." }]
}
```

`question` must be a non-empty string. `history` is optional; non-array values are treated as empty history.

| Event | Meaning |
| --- | --- |
| `status` | `retrieving` or `generating` progress. |
| `sources` | Retrieved document IDs, titles, chunk indices, and snippets. |
| `token` | One incremental generated text fragment. |
| `done` | Final assembled answer. |
| `error` | Failure message emitted within the stream. |

Invalid JSON/question returns 400; a missing API key returns 500 before streaming begins.
