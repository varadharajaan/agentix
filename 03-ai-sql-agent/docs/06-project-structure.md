# Project Structure

```text
03-ai-sql-agent/
├── docs/                              # Numbered project documentation
│   ├── 01-overview.md
│   ├── 02-getting-started.md
│   ├── 03-architecture.md
│   ├── 04-agent-and-safety.md
│   ├── 05-api-reference.md
│   └── 06-project-structure.md
├── public/                            # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── databases/route.ts     # List and upload SQLite files
│   │   │   └── query/route.ts         # Run the AI SQL agent
│   │   ├── globals.css                # Global Tailwind/theme styles
│   │   ├── layout.tsx                 # Root layout and metadata
│   │   └── page.tsx                   # Client dashboard and state
│   ├── components/
│   │   ├── database-sidebar.tsx       # Database selection/upload UI
│   │   ├── header.tsx                 # Header component
│   │   ├── sql/                       # Prompt, loading, SQL, result, explanation panels
│   │   └── ui/                        # Reusable UI primitives
│   ├── data/
│   │   ├── company.db                 # Built-in SQLite database
│   │   └── uploads/                   # Locally uploaded SQLite files
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── agent/                 # Model, prompt, agent, response formatter
│   │   │   └── tools/                 # Table, schema, and query agent tools
│   │   ├── validation/query-schema.ts  # Request validation
│   │   ├── database-files.ts          # Database file lifecycle
│   │   ├── db.ts                      # Read-only SQLite operations
│   │   ├── sql-validator.ts           # SELECT-only validation
│   │   └── utils.ts                   # className helper
│   └── types/                         # Agent, database, and tool types
├── .env.local                         # Local API key; not committed
├── components.json                    # shadcn/UI configuration
├── package.json                       # Scripts and dependencies
├── README.md                          # Minimal project introduction
└── tsconfig.json                      # TypeScript and @/* alias configuration
```

## Conventions

- Use the `@/` alias for imports from `src/`.
- Keep API keys only in `.env.local` and server-side code.
- Keep database operations read-only and route all agent SQL through `sql-validator.ts`.
- Do not edit installed `node_modules/` or uploaded database files manually while the app is using them.
