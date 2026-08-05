# Getting Started

This guide covers the basic steps to install dependencies, configure environment variables, and run the application locally.

## Prerequisites

- Node.js 20+ recommended
- npm
- An OpenAI API key

## Installation

```bash
npm install
cp .env.example .env.local
```

Then add your API key to the local environment file:

```env
OPENAI_API_KEY=your_key_here
```

Optional values:

```env
OPENAI_CHAT_MODEL=gpt-5.5
```

## Running locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Database behavior

The application creates its SQLite database automatically on first run at:

- data/app.db

The database schema is defined in [src/lib/db/schema.sql](../src/lib/db/schema.sql).

## Supported file types

The current implementation supports:

- PDF
- DOCX
- TXT
- Markdown
- CSV
- JSON

## Troubleshooting

- If the app reports missing API credentials, verify that your environment file exists and contains OPENAI_API_KEY.
- If uploads fail, check whether the file type is supported and whether the file size stays below the 25 MB limit.
- If processing appears stuck, inspect the document status in the dashboard or the server logs.
