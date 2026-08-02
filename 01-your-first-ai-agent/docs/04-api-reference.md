# API Reference

## `POST /api/chat`

Streams an agent response for AI SDK UI messages.

### Request

Content type: `application/json`.

```json
{
  "messages": [
    {
      "id": "message-1",
      "role": "user",
      "parts": [{ "type": "text", "text": "What is the weather in Tokyo?" }]
    }
  ]
}
```

In normal usage `useChat` creates this payload. Direct clients should use the `UIMessage` format compatible with the installed AI SDK version.

### Response

The response is an AI SDK UI message stream. It may contain text, reasoning, and dynamic/named tool parts with their input, output, and execution state. The UI renders these through `AssistantMessage`, `TextPart`, `ReasoningPart`, and `ToolCallPart`.

### Limits and errors

The route exports `maxDuration = 60`, so tools must complete promptly on hosts that honor route duration configuration. The current implementation delegates parsing, provider, and stream errors to the runtime. A production API should add request validation, safe error responses, rate limiting, and structured logs.
