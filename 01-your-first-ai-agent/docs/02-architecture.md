# Architecture

```text
src/app/page.tsx (client)
  useChat() + chat components
          | POST /api/chat with UIMessage[]
          v
src/app/api/chat/route.ts (server)
  AI SDK <-> LangChain message/stream adapters
          v
src/agent/graph.ts
  system prompt + model + tool registry
       |                 |
       v                 v
model.ts           tools/weather.ts, tools/calculator.ts
```

## Client

The home page uses `useChat` from `@ai-sdk/react`, owns the draft input, and receives streamed `UIMessage` objects. `MessageList` renders user messages and assistant parts. `PromptBox` provides example prompts, Enter-to-send, Shift+Enter for a newline, and a stop control. The sidebar imports the shared tool registry so its list matches the active server tools.

## Server and streaming

`POST /api/chat` converts incoming `UIMessage` values to LangChain `BaseMessage` objects through `toBaseMessages`. It streams the agent in `messages` and `tools` modes, then uses `toUIMessageStream` and `createUIMessageStreamResponse` to send a browser-compatible stream back. `maxDuration` is 60 seconds.

This boundary keeps API keys and tool execution on the server; the browser does neither directly.

## Agent loop and state

A request creates an agent with a model, system prompt, and registered tools. The model either answers or calls a tool, receives its result, then forms a final answer. The interface represents that tool activity with collapsible cards.

Conversation history is held only in the browser's active `useChat` state. There is no database, authentication, conversation ID, or server-side persistence; a refresh clears the chat.
