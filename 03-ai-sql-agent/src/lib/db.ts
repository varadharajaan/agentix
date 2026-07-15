import Database from "better-sqlite3";
import path from "path";

import { TableColumn } from "@/types/database";

export const DEFAULT_DATABASE = "company.db";

function openDatabase(databasePath?: string) {
  const db = new Database(
    databasePath ?? path.join(process.cwd(), "src/data", DEFAULT_DATABASE),
    { readonly: true },
  );
  db.pragma("foreign_keys = ON");
  return db;
}

export function executeQuery(
  sql: string,
  databasePath?: string,
): Record<string, unknown>[] {
  const db = openDatabase(databasePath);
  try {
    return db.prepare(sql).all() as Record<string, unknown>[];
  } finally {
    db.close();
  }
}

export function getTables(databasePath?: string): string[] {
  const db = openDatabase(databasePath);
  try {
    const rows = db
    .prepare(
      `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
      ORDER BY name
      `,
    )
      .all() as { name: string }[];

    return rows.map((row) => row.name);
  } finally {
    db.close();
  }
}

export function getTableSchema(
  table: string,
  databasePath?: string,
): TableColumn[] {
  const tables = getTables(databasePath);

  if (!tables.includes(table)) {
    throw new Error(`Table "${table}" does not exist.`);
  }

  const db = openDatabase(databasePath);
  try {
    return db.prepare(`PRAGMA table_info("${table}")`).all() as TableColumn[];
  } finally {
    db.close();
  }
}
