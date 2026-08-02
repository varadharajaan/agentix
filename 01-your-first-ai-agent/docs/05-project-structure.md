# Project Structure

```text
01-your-first-ai-agent/
├── docs/                         # Project documentation
│   ├── README.md                  # Documentation index
│   ├── README.md                  # Documentation entry point
│   ├── 01-getting-started.md      # Setup and development
│   ├── 02-architecture.md         # Request and stream design
│   ├── 03-agent-and-tools.md      # Agent/tool reference
│   ├── 04-api-reference.md        # Chat API contract
│   └── 05-project-structure.md    # This guide
├── public/                        # Static assets
├── src/
│   ├── agent/
│   │   ├── graph.ts               # Agent creation and streaming
│   │   ├── model.ts               # ChatOpenAI settings
│   │   └── tools/
│   │       ├── index.ts           # Shared tool registry
│   │       ├── weather.ts         # Open-Meteo weather lookup
│   │       └── calculator.ts      # mathjs calculation
│   ├── app/
│   │   ├── api/chat/route.ts      # Streaming POST endpoint
│   │   ├── layout.tsx             # Root layout, fonts, metadata
│   │   ├── page.tsx               # Chat page/useChat integration
│   │   └── globals.css            # Global theme/styles
│   ├── components/
│   │   ├── chat/                  # Layout, input, sidebar, messages
│   │   ├── markdown/              # Markdown and code rendering
│   │   ├── message/               # User/assistant and streamed parts
│   │   └── ui/                    # Reusable primitives
│   └── lib/utils.ts               # className merge helper
├── .env.example                   # Safe environment template
├── .env.local                     # Local secrets; ignored by Git
├── components.json                # shadcn/UI configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Scripts/dependencies
├── postcss.config.mjs             # Tailwind PostCSS integration
└── tsconfig.json                  # TypeScript and @/* path alias
```

## Conventions

- Use `@/` for imports rooted at `src/`.
- Keep server-only agent logic in `src/agent/` and route handlers.
- Interactive React components use `"use client"`.
- Keep tool code separate from UI-specific tool labels and icons.
- Do not edit `.next/` or `node_modules/`; they are generated/installed artifacts.
