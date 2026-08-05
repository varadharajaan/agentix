# API Reference

This document summarizes the main API routes exposed by the application.

## Document endpoints

### GET /api/documents

Returns the list of uploaded documents and their current status.

### POST /api/documents

Uploads one or more files using multipart form data.

Request body:

- field name: files
- value: one or more File objects

Behavior:

- validates the file size
- creates a document record
- starts asynchronous processing
- returns the created document metadata

### GET /api/documents/[id]

Returns the details for a single document.

### DELETE /api/documents/[id]

Deletes a document record and its related data.

## Chat endpoint

### POST /api/chat

Sends a question to the document intelligence workflow.

Request body:

```json
{
  "message": "Summarize the uploaded contract",
  "conversationId": "optional-existing-id",
  "documentIds": ["optional-document-id-list"]
}
```

Response includes:

- conversationId
- message record
- detected intent

## Comparison endpoint

### POST /api/compare

Runs a multi-document comparison request.

## Extraction endpoint

### POST /api/extract

Extracts structured information from a document and returns JSON-shaped output.

## Reports endpoint

### POST /api/reports

Generates a summary or detailed report based on the selected documents.

## Conversation history endpoint

### GET /api/conversations/[id]/messages

Returns the message history for a specific conversation.
