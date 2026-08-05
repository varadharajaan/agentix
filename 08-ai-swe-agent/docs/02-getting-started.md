# Getting started

This guide walks you through installing the project, configuring the environment, and running it locally.

## Requirements

Before you begin, make sure you have:

- Node.js 22.5 or newer,
- npm,
- an OpenAI API key.

You can verify your Node version with:

```bash
node -v
```

## 1. Install dependencies

From the project root, run:

```bash
npm install
```

## 2. Configure environment variables

Copy the example environment file and fill in your settings:

```bash
cp .env.example .env.local
```

Then update .env.local with your values.

At minimum, set:

```env
OPENAI_API_KEY=your-api-key
```

You can optionally override:

```env
OPENAI_CHAT_MODEL=gpt-5.5
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
DATA_DIR=./data
```

## 3. Run the app locally

Start the development server:

```bash
npm run dev
```

Open the app in your browser at:

```text
http://localhost:3000
```

## 4. Upload and index a repository

From the UI:

1. drag and drop a repository ZIP file into the upload area, or
2. click to choose a ZIP archive from disk.

The app will then:

- unzip the archive,
- extract source files,
- split them into chunks,
- generate embeddings,
- save the indexed repository in the local database.

## 5. Use the app

Once indexing finishes, you can:

- browse files,
- search semantically,
- ask the AI questions,
- generate docs, reviews, tests, or architecture summaries.

## Build for production

To create a production build, run:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## Notes

- The project stores its SQLite database and extracted repository data under the data folder by default.
- If you are using an older Node version, upgrade before running this app because the project relies on Node's built-in SQLite support.
- Large repositories may take longer to ingest because embedding generation is network-bound and can be slow.
