# Overview

AI Memory Assistant is a Next.js demo application that gives a chat experience a persistent memory layer. It stores durable facts about a user such as preferences, goals, projects, and constraints, then uses those memories to personalize future conversations.

## What the project does

- Streams chat responses from a conversational AI model
- Retrieves relevant memories before generating a reply
- Extracts new memories after each turn using tool-calling AI logic
- Displays the current memory store in a live side panel
- Persists memories in a local SQLite database for a simple demo setup

## Core experience

A user can chat normally while the application quietly learns useful facts about them. The memory panel updates as new memories are created, revised, or forgotten, giving the experience of a personal assistant that remembers over time.

## Key ideas

- Long-term memory is treated as a first-class part of the experience
- Memory updates happen through structured tool calls rather than manual prompts
- Retrieval is semantic, based on embedding similarity rather than simple keyword matching
- The project is designed as a practical reference for building memory-aware AI apps
