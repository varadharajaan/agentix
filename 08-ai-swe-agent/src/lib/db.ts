import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), "data");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.join(DATA_DIR, "repos"), { recursive: true });

const DB_PATH = path.join(DATA_DIR, "app.db");

// A single shared connection — SQLite handles concurrent reads fine for a
// local single-user dev tool like this one. Uses Node's built-in node:sqlite
// (stable, unflagged since Node 23.4+) instead of a native addon, so there's
// nothing to compile on install — this just works on Windows/macOS/Linux.
declare global {
  // eslint-disable-next-line no-var
  var __aiSweDb: DatabaseSync | undefined;
}

export const db: DatabaseSync = global.__aiSweDb ?? new DatabaseSync(DB_PATH);
if (process.env.NODE_ENV !== "production") global.__aiSweDb = db;

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS repositories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  file_count  INTEGER NOT NULL DEFAULT 0,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  total_lines INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'indexing',
  error       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS files (
  id          TEXT PRIMARY KEY,
  repo_id     TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  path        TEXT NOT NULL,
  language    TEXT NOT NULL,
  lines       INTEGER NOT NULL,
  size_bytes  INTEGER NOT NULL,
  content     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_files_repo ON files(repo_id);

CREATE TABLE IF NOT EXISTS chunks (
  id          TEXT PRIMARY KEY,
  repo_id     TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  file_id     TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  path        TEXT NOT NULL,
  language    TEXT NOT NULL,
  start_line  INTEGER NOT NULL,
  end_line    INTEGER NOT NULL,
  symbol      TEXT,
  content     TEXT NOT NULL,
  embedding   BLOB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chunks_repo ON chunks(repo_id);
CREATE INDEX IF NOT EXISTS idx_chunks_file ON chunks(file_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          TEXT PRIMARY KEY,
  repo_id     TEXT NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  content     TEXT NOT NULL,
  sources     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_chat_repo ON chat_messages(repo_id);
`);

export function reposDir(repoId: string) {
  const dir = path.join(DATA_DIR, "repos", repoId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * node:sqlite has no built-in `.transaction()` helper like better-sqlite3 —
 * this wraps a batch of writes in BEGIN/COMMIT (rolling back on error) so
 * bulk inserts during ingestion stay atomic and fast.
 */
export function transaction<T>(fn: () => T): T {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// ---- float32 array <-> BLOB helpers -----------------------------------

export function embeddingToBlob(vec: number[]): Uint8Array {
  const buf = Buffer.alloc(vec.length * 4);
  for (let i = 0; i < vec.length; i++) buf.writeFloatLE(vec[i], i * 4);
  return buf;
}

export function blobToEmbedding(blob: Uint8Array): Float32Array {
  const buf = Buffer.from(blob.buffer, blob.byteOffset, blob.byteLength);
  const arr = new Float32Array(buf.length / 4);
  for (let i = 0; i < arr.length; i++) arr[i] = buf.readFloatLE(i * 4);
  return arr;
}

export { DATA_DIR };
