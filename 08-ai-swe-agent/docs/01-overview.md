# Overview

The AI Software Engineering Agent is a local-first repository intelligence tool. Instead of treating a codebase as a collection of files, it turns uploaded repositories into a searchable, context-aware knowledge base that can answer questions about architecture, implementation details, bugs, documentation needs, and test coverage.

## What the project does

A user uploads a repository as a ZIP archive. The app then:

1. extracts the archive,
2. filters out irrelevant files and build artifacts,
3. reads source files as text,
4. splits the content into smaller chunks,
5. generates embeddings for those chunks,
6. stores the repository metadata, files, chunks, and vectors in a local SQLite database.

Once indexing is complete, the user can:

- search the repo semantically,
- ask questions in natural language,
- request documentation for a file or the whole repository,
- review code for issues,
- generate tests,
- ask for architecture explanations.

## Core value proposition

The central idea is to help developers reason about unfamiliar codebases quickly. The app is built around retrieval-augmented generation (RAG): the system retrieves relevant code snippets from the indexed repository and uses them as grounding context for an LLM response.

That means the answers are anchored in content that actually exists in the repository rather than purely in the model's general knowledge.

## Main user experience

The app presents a dashboard with:

- a repository picker and upload experience,
- a file tree for browsing indexed files,
- a code viewer for reading file contents,
- a semantic search panel,
- a chat panel for asking questions,
- an analysis panel for docs, reviews, tests, and architecture tasks.

## Key capabilities

### Repository ingestion

The ingestion path is designed to be practical for local development. It works with ZIP archives, filters build output and dependency folders, and uses a simple language classifier to decide whether a file is worth indexing.

### Semantic search

The search experience embeds both the user query and each stored code chunk, then ranks them by cosine similarity. This allows the app to retrieve semantically relevant snippets even when the user does not use the exact same vocabulary as the code.

### AI-assisted engineering tasks

The same retrieval stack powers several specialized modes:

- chat: answer questions about the repository,
- docs: generate documentation,
- review: look for issues or improvement suggestions,
- tests: generate unit test ideas or test code,
- architecture: explain the overall system layout.

## Why this project matters

This project is useful for:

- onboarding new developers into an unfamiliar codebase,
- understanding legacy projects quickly,
- accelerating code review and documentation tasks,
- exploring a repository using natural language rather than keyword-based search alone.

## Important limitations

The app is designed as a local developer tool, not a multi-tenant SaaS platform. It uses a local SQLite database and local storage for extracted repository content.

Other practical limitations include:

- indexing depends on OpenAI embeddings and an API key,
- the chunker is heuristic rather than a full parser,
- semantic search is implemented in-process for a single-repo workflow and is not meant to replace enterprise-scale vector infrastructure.
