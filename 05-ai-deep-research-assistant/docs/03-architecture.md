# 03. Architecture

The project uses a simple layered architecture centered around a streaming research pipeline.

## Core layers

- Frontend: the dashboard and research panels in the components folder
- API layer: the research route in the app router
- Research engine: planning, execution, and report writing logic in lib/research
- State management: a client-side hook that parses the event stream

## Request flow

1. The user submits a question from the dashboard.
2. The frontend sends the question to the research API route.
3. The API route starts a streaming response.
4. The backend orchestrates planning, searching, evidence gathering, and report writing.
5. Each stage emits events that update the UI in real time.

## Main modules

- app/api/research/route.ts: receives the request and streams NDJSON events
- hooks/use-research.ts: parses the event stream into UI state
- lib/research/planner.ts: creates the research plan
- lib/research/executor.ts: runs the full workflow
- lib/research/report.ts: synthesizes the final markdown report
- lib/research/types.ts: defines the shared event and data contracts

## Event-driven UI

The backend communicates with the frontend through a stream of research events. These events allow the UI to show:

- live progress
- subtopic results
- sources found during the run
- citations used in the report
- the final synthesized report

## Design goals

The architecture favors clarity and streaming interactivity over a monolithic request-response flow. Each component has a single responsibility, which makes the project easier to extend and understand.
