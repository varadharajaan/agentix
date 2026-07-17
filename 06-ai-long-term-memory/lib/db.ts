import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

// This module must only ever run on the server (Node.js runtime) - it's a
// native binding to a local SQLite file, not something that can run in the
// browser or at the edge. Every API route that imports it declares
// `export const runtime = "nodejs"`.

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, "memory.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'local-user',
    type TEXT NOT NULL CHECK (type IN ('preference', 'goal', 'project', 'constraint')),
    content TEXT NOT NULL,
    confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('low', 'medium', 'high')),
    embedding TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_memories_user ON memories (user_id);
`);

export default db;
