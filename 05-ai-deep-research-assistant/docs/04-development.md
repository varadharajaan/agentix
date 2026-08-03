# 04. Development

## Available scripts

Run these commands from the project root:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project conventions

- The app uses Next.js App Router conventions.
- The research pipeline is organized under lib/research.
- Shared UI primitives come from components/ui.
- The research state is managed client-side through a hook.

## Where to make changes

- UI updates: components/
- New research behaviors: lib/research/
- API behavior: app/api/research/route.ts
- Streaming state handling: hooks/use-research.ts
- Styling and layout tweaks: app/globals.css and component-specific files

## Suggested workflow

1. Start the app locally.
2. Test a research query.
3. Inspect the generated plan, sources, and report.
4. Adjust the relevant module.
5. Re-run the workflow and verify the result.

## Extension ideas

- Add persistence for completed research runs
- Improve source ranking and quality filters
- Swap the search provider for a different backend
- Add authentication and history for multiple users
