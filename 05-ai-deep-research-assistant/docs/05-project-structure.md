# 05. Project Structure

The repository is organized into a small set of directories that reflect the app’s responsibilities.

## Top-level files

- package.json: scripts and dependencies
- next.config.ts: Next.js configuration
- tsconfig.json: TypeScript configuration
- components.json: shadcn/ui configuration

## App layer

- app/page.tsx: the app entry point
- app/layout.tsx: root layout and global shell
- app/globals.css: global styles and theme tokens
- app/api/research/route.ts: streaming research API

## UI layer

- components/research-dashboard.tsx: main dashboard container
- components/plan-panel.tsx: plan and subtopic progress view
- components/sources-panel.tsx: discovered sources
- components/citations-panel.tsx: citation list
- components/progress-timeline.tsx: live workflow timeline
- components/report-view.tsx: report rendering
- components/ui/: reusable UI primitives from shadcn/ui

## Logic layer

- hooks/use-research.ts: client-side event stream handling
- lib/research/planner.ts: plan generation
- lib/research/executor.ts: research orchestration
- lib/research/report.ts: report synthesis
- lib/research/types.ts: shared types and event definitions
- lib/utils.ts: helper functions

## Documentation layer

- docs/: project documentation and guides
