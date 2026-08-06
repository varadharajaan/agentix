# Documentation

This folder contains the complete developer documentation for the AI Software Engineering Agent project.

## Documentation map

- [01-overview.md](01-overview.md) — What the project does, the core value proposition, and the main user flows.
- [02-getting-started.md](02-getting-started.md) — Installation, environment setup, and first-run steps.
- [03-api-reference.md](03-api-reference.md) — REST API endpoints used by the app.
- [04-architecture.md](04-architecture.md) — System design, runtime architecture, and data flow.
- [05-project-structure.md](05-project-structure.md) — Source tree layout and the role of each module.
- [06-troubleshooting.md](06-troubleshooting.md) — Common problems and practical fixes.

## Quick summary

This project is a local-first repository understanding tool. You upload a repository as a ZIP, the app extracts it, splits files into chunks, generates embeddings, stores them in SQLite, and then lets you query the repository using semantic search and AI-generated analysis.

The main experience is a web app built with Next.js that combines:

- a repository upload flow,
- a file explorer and code viewer,
- semantic search over indexed code,
- AI chat for answers grounded in repository context,
- specialized modes for documentation, review, tests, and architecture.

## Recommended reading order

1. Start with [01-overview.md](01-overview.md).
2. Follow [02-getting-started.md](02-getting-started.md) to run the app locally.
3. Use [04-architecture.md](04-architecture.md) and [05-project-structure.md](05-project-structure.md) when exploring the codebase.
4. Refer to [03-api-reference.md](03-api-reference.md) if you want to use the server endpoints directly.
