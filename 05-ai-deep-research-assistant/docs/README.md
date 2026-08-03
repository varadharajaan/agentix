# Deep Research Assistant Documentation

This folder contains the project documentation for the Deep Research Assistant app.

## What this project does

Deep Research Assistant is a Next.js application that behaves like an autonomous research workspace rather than a traditional chatbot. A user submits a question, the app plans a research strategy, searches the web across multiple subtopics, gathers evidence, deduplicates sources, and produces a cited markdown report that is streamed live into the UI.

## Main capabilities

- Accepts a research question from the user
- Breaks the question into subtopics and search queries
- Uses OpenAI web search tooling to gather evidence
- Tracks sources and citations in real time
- Streams progress updates as the report is built
- Renders a final structured report with inline citations

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS v4 and shadcn/ui components
- AI SDK with OpenAI web search support
- Zod for structured generation
- React Markdown and remark-gfm for report rendering

## Project structure

- app/ contains the app router entry points and the API route
- components/ contains the dashboard UI and panels
- hooks/ contains the streaming client-side research state hook
- lib/research/ contains the planning, execution, and reporting pipeline
- docs/ contains this documentation set

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create the local environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Set your OpenAI API key in .env.local.
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000 and ask a research question.

## Documentation map

- [Architecture](./architecture.md) explains how the app is built and how data flows through the system.
- [Development Guide](./development.md) covers setup, commands, environment variables, and extension ideas.

## Summary of the runtime flow

1. The user enters a question in the dashboard.
2. The frontend sends the question to the research API.
3. The backend runs a multi-step research pipeline.
4. Each step emits events that update the UI in real time.
5. The final report is displayed with citations and source references.

This project is intended as a practical example of a research agent that combines planning, web search, evidence gathering, and structured synthesis in one experience.
