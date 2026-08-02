# Your First AI Agent

Your First AI Agent is a course project that demonstrates how to build a practical, streaming AI chat assistant with Next.js. A user sends a question through a browser chat interface, the server runs a LangChain agent with an OpenAI-compatible chat model, and the answer streams back token by token. The agent can decide when to use built-in tools for current weather or mathematical calculations, and the interface displays the tool activity alongside the final response.

## Documentation

The [`docs/`](./) folder contains detailed reference material for the project, including setup, architecture, the agent and tools, the API contract, and the source-tree layout. Read the numbered files in order:

| Document | Purpose |
| --- | --- |
| [01 - Getting started](./01-getting-started.md) | Install, configure, and run the app. |
| [02 - Architecture](./02-architecture.md) | Understand the frontend, API, agent, and streaming flow. |
| [03 - Agent and tools](./03-agent-and-tools.md) | Reference the model, system prompt, and tools. |
| [04 - API reference](./04-api-reference.md) | Extend the chat endpoint. |
| [05 - Project structure](./05-project-structure.md) | Find the responsibility of every important file and directory. |

## At a glance

- **Framework:** Next.js 16, React 19, TypeScript
- **Agent runtime:** LangChain `createAgent` with `ChatOpenAI`
- **Stream integration:** Vercel AI SDK and `@ai-sdk/langchain`
- **Tools:** current weather lookup and a math calculator
- **UI:** Tailwind CSS, Base UI primitives, and custom chat components

```text
Browser chat UI -> POST /api/chat -> LangChain agent (model + tools)
                <- AI SDK UI message stream <- agent stream
```

## Scope

This is an educational app. Conversation state is held in the active browser session and is not persisted. Tool results depend on external services, and model output can be inaccurate. Never commit `.env.local` or expose an API key in browser code.
