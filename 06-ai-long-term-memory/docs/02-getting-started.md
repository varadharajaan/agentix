# Getting Started

## Prerequisites

- Node.js 20 or newer
- npm
- An OpenAI API key

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Add your OpenAI key to the environment file:

   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app in your browser at http://localhost:3000.

## Notes

- The first run creates a local SQLite file at data/memory.db.
- The project uses better-sqlite3, which typically installs without extra setup, but native build issues may require Python and a C++ toolchain.
- The demo uses a single local user ID, so it is intended for local experimentation rather than multi-user production use.
