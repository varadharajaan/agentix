# Overview

Document Intelligence Agent is a full-stack document Q&A and analysis application built with Next.js, React, TypeScript, LangGraph, and OpenAI. It lets users upload documents, extract text, chunk and embed content, store it in SQLite, and then ask natural-language questions grounded in the uploaded sources.

## What the project does

The product is designed for three core workflows:

- Upload and process documents such as PDF, DOCX, TXT, Markdown, CSV, and JSON.
- Ask questions about one or many documents and receive grounded answers with citations.
- Generate higher-level outputs such as comparisons, structured extraction, and summaries.

## Key capabilities

- Document ingestion and parsing
- Semantic retrieval over document chunks
- Multi-document comparison
- Structured extraction into JSON-like output
- Conversation history for chat sessions
- A polished dashboard experience built with shadcn/ui and Tailwind CSS

## Project goals

The application demonstrates how an AI agent can work over private document content without requiring a separate vector database. It uses SQLite for persistence and TypeScript-based cosine similarity for retrieval, keeping the implementation self-contained and approachable.

## Typical user journey

1. Upload one or more documents.
2. Wait for the pipeline to extract, clean, chunk, and embed content.
3. Ask questions or request summaries, comparisons, or extraction jobs.
4. Review answers with source citations tied to the underlying chunks.
