# RAG Pipeline

## Document ingestion

```text
Upload -> create document row (processing)
       -> extract text -> split chunks -> embed chunks -> persist chunks
       -> mark document ready -> invalidate cached vector store
```

`ingestDocument` emits NDJSON progress events for `extracting`, `chunking`, `embedding`, and `storing` so the interface can provide live status. PDFs use `pdf-parse`; other supported files are treated as UTF-8 text.

Chunks are produced by `RecursiveCharacterTextSplitter` with a 1,000-character chunk size and 150-character overlap. The OpenAI embedding model is configurable through `RAG_EMBEDDING_MODEL`.

## Retrieval and generation

```text
Question + previous browser chat turns
  -> similarity search (top 5 chunks)
  -> system prompt containing numbered excerpts
  -> streaming ChatOpenAI response
  -> answer tokens, sources, and final answer as NDJSON
```

The LangGraph has two ordered nodes: `retrieve` and `generate`. Retrieval calls a LangChain retriever with `k = 5`. Generation sends the retrieved excerpts in a system prompt and instructs the model to answer **only** from them, cite excerpt numbers inline, and state plainly when evidence is insufficient.

## Grounding and citations

The API converts retrieved LangChain documents into source objects containing document ID, title, chunk index, and a truncated snippet. Excerpt numbers in the generated response refer to the numbered context supplied to the model. This is model-directed grounding, not a strict citation validator; production implementations should validate citations and consider adding relevance thresholds.

## Important limitations

- Retrieval has no explicit minimum similarity score, so a query may retrieve weakly related chunks.
- The in-memory vector store is per server process; each process rebuilds it from SQLite when needed.
- No file-size or content-type enforcement occurs on the server beyond extraction behavior; production uploads need limits and validation.
- PDF text extraction does not OCR scanned pages.
