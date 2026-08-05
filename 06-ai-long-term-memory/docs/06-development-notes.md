# Development Notes

## Environment variables

The app expects at least the following environment variable:

```env
OPENAI_API_KEY=your_api_key_here
```

Optional overrides include:

```env
MEMORY_MODEL=gpt-5.1
MEMORY_EMBEDDING_MODEL=text-embedding-3-small
```

## Local database

On first run, the application creates a SQLite database file at data/memory.db. The schema is defined in the database module and is automatically initialized when the app starts.

## Extending the project

Possible next steps include:

- Adding authentication and user accounts
- Switching from SQLite to Postgres or another hosted database
- Improving memory ranking with a dedicated vector database
- Adding richer memory editing and visualization features
