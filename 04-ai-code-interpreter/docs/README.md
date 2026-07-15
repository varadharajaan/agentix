# Project documentation

This folder documents the AI Code Interpreter application. It is a Next.js application that accepts files and natural-language requests, asks an OpenAI model to generate Python, runs that Python in a session workspace, and returns generated artifacts.

## Documentation map

| Document | Use it for |
| --- | --- |
| [Getting started](./getting-started.md) | Installing, configuring, and running the application |
| [Architecture](./architecture.md) | Understanding the application flow and code ownership |
| [API reference](./api-reference.md) | Integrating with or modifying the HTTP endpoints |
| [User workflow](./user-workflow.md) | Using uploads, prompts, and generated artifacts |
| [Security and deployment](./security-and-deployment.md) | Safely operating the Python execution feature |

## Technology at a glance

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS and local UI components
- LangChain with OpenAI chat models
- Python for data analysis and artifact generation
- Local filesystem-backed session storage

## Main entry points

- `src/app/page.tsx` — browser application state and streaming client
- `src/app/api/chat/route.ts` — agent execution endpoint
- `src/lib/agent.ts` — LLM/tool orchestration
- `src/lib/executor.ts` — Python process execution
- `src/lib/fs-utils.ts` — session files and artifact metadata

> The root `README.md` is the default Next.js starter README. Use this folder for project-specific operational documentation.
