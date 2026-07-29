import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// A single, process-wide SQLite connection. `better-sqlite3` is
// synchronous and file-backed, so one shared handle is all we need —
// no connection pool required.

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");
const SCHEMA_PATH = path.join(process.cwd(), "src", "lib", "db", "schema.sql");

declare global {
  var __docIntelDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);

  return db;
}

// Reuse the connection across hot reloads in dev.
export const db = globalThis.__docIntelDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalThis.__docIntelDb = db;
}
