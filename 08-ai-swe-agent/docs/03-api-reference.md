# API reference

The application exposes a small set of REST endpoints under the Next.js app router. These endpoints support repository upload, repository listing, file retrieval, semantic search, and the AI-powered analysis modes.

## Base URL

When running locally, the base URL is:

```text
http://localhost:3000
```

## Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| /api/upload | POST | Upload a repository ZIP and start ingestion |
| /api/repos | GET | List indexed repositories |
| /api/repos/[id] | GET | Fetch metadata for one repository |
| /api/repos/[id] | DELETE | Delete a repository record |
| /api/repos/[id]/files | GET | List files belonging to a repository |
| /api/repos/[id]/file | GET | Fetch the raw contents of one file |
| /api/search | POST | Run semantic search for a repository |
| /api/chat | GET | Fetch chat history for a repo |
| /api/chat | POST | Ask a question about the repository |
| /api/docs | POST | Generate documentation for a file or repository |
| /api/review | POST | Review a file for bugs and issues |
| /api/tests | POST | Generate test suggestions or test code |
| /api/architecture | POST | Explain the architecture of the repository |

## Upload a repository

### POST /api/upload

Accepts multipart form data with a single file field named file.

#### Request

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/repo.zip"
```

#### Response

```json
{
  "repoId": "some-generated-id"
}
```

## List repositories

### GET /api/repos

Returns the indexed repositories and their current status.

## Get one repository

### GET /api/repos/[id]

Returns repository metadata such as name, file count, chunk count, line count, and status.

## Get repository files

### GET /api/repos/[id]/files

Returns the indexed files for a repository.

## Get one file

### GET /api/repos/[id]/file?path=src/lib/db.ts

Returns the file contents and language label for the requested path.

## Semantic search

### POST /api/search

Body:

```json
{
  "repoId": "repo-id",
  "query": "How is the database initialized?",
  "topK": 8
}
```

Response:

```json
{
  "results": [
    {
      "path": "src/lib/db.ts",
      "startLine": 1,
      "endLine": 40,
      "score": 0.91
    }
  ]
}
```

## Chat

### POST /api/chat

Body:

```json
{
  "repoId": "repo-id",
  "message": "Explain the ingestion flow"
}
```

The route stores the user message, runs the analysis graph, and saves the assistant response with source citations.

## Documentation, review, tests, and architecture

The endpoints under /api/docs, /api/review, /api/tests, and /api/architecture all follow the same pattern:

- they require a repoId,
- they construct a prompt for an agent mode,
- they run the same retrieval-based analysis workflow,
- they return an answer with source references.
