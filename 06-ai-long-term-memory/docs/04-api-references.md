# API Reference

## Chat API

### POST /api/chat

Generates a personalized chat reply using relevant memories.

#### Request body

```json
{
  "message": "Hello there",
  "history": []
}
```

#### Behavior

- Retrieves relevant memories for the message
- Injects those memories into the system prompt
- Streams the assistant response back to the client

## Memory API

### GET /api/memories

Returns the current list of memories for the local demo user.

### DELETE /api/memories?id=<memory-id>

Deletes a memory manually from the store.

## Memory Extraction API

### POST /api/memories/extract

Receives a completed user/assistant exchange and streams NDJSON memory events.

#### Request body

```json
{
  "user": "I prefer TypeScript",
  "assistant": "That makes sense. I can help with TypeScript tasks."
}
```

#### Response type

The endpoint streams JSON lines with events such as:

- operation events for create/update/forget actions
- a done event when extraction finishes
- an error event if something fails
