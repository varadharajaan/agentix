# Troubleshooting

This page collects common issues that can appear while installing or running the app.

## OpenAI API key errors

If you see an error about missing credentials, confirm that your .env.local file contains a valid OPENAI_API_KEY.

```bash
cp .env.example .env.local
```

Then edit the file and set your key.

## Node version errors

The project relies on Node's built-in SQLite support. If you run into compatibility issues, make sure you are using Node 22.5 or newer.

Check your version with:

```bash
node -v
```

## Upload fails or indexing stops

Possible causes include:

- the uploaded file is not a ZIP archive,
- the archive is too large or contains mostly binary artifacts,
- the repo contains very few recognized text files,
- the OpenAI API request failed during embedding generation.

Check the error shown in the UI or server logs, and ensure the uploaded archive is a normal repository export.

## Search returns weak or empty results

If semantic search seems unhelpful:

- try a more descriptive query,
- confirm the repository was fully indexed,
- make sure the repository is marked as ready rather than indexing or error.

## The app is slow

Embedding generation is the most time-consuming step. Large repositories will take longer to ingest. This is expected because each chunk needs an embedding call.

## Files are missing from the UI

If a file does not appear in the file tree, it may have been filtered out because:

- it has an unsupported extension,
- it is under a commonly ignored folder such as node_modules or dist,
- it is too large to read.
