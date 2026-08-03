# 02. Getting Started

## Prerequisites

Before running the project locally, make sure you have:

- Node.js installed
- npm available
- An OpenAI API key that can access a model supporting the web search tool

## Installation

From the project root, run:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

Then add your API key:

```env
OPENAI_API_KEY=your_key_here
```

You can optionally override the model:

```env
RESEARCH_MODEL=gpt-5.1
```

## Run locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## First usage

1. Enter a research question in the input box.
2. Wait for the assistant to create a plan.
3. Watch the progress timeline as the research runs.
4. Review the generated report, sources, and citations.

## Common setup issues

- If the app fails immediately, confirm that the API key is present.
- If the model cannot use web search, switch to a supported OpenAI model.
- If the report is empty or weak, try a clearer and more specific question.
