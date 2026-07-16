import fs from "fs/promises";
import path from "path";

import { DEFAULT_DATABASE } from "@/lib/db";

const dataDirectory = path.join(process.cwd(), "src", "data");
const uploadsDirectory = path.join(dataDirectory, "uploads");
const allowedExtensions = new Set([".db", ".sqlite", ".sqlite3"]);

export type DatabaseFile = {
  name: string;
  path: string;
  size: number;
  isDefault: boolean;
};

export async function listDatabaseFiles(): Promise<DatabaseFile[]> {
  const defaultPath = path.join(dataDirectory, DEFAULT_DATABASE);
  const defaultStats = await fs.stat(defaultPath);
  await fs.mkdir(uploadsDirectory, { recursive: true });
  const uploads = await fs.readdir(uploadsDirectory, { withFileTypes: true });
  const uploadedFiles = await Promise.all(
    uploads
      .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()))
      .map(async (entry) => {
        const filePath = path.join(uploadsDirectory, entry.name);
        const stats = await fs.stat(filePath);
        return { name: entry.name, path: filePath, size: stats.size, isDefault: false };
      }),
  );
  return [
    { name: DEFAULT_DATABASE, path: defaultPath, size: defaultStats.size, isDefault: true },
    ...uploadedFiles.sort((a, b) => a.name.localeCompare(b.name)),
  ];
}

export async function saveDatabaseFile(file: File): Promise<DatabaseFile> {
  const extension = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error("Upload a SQLite database (.db, .sqlite, or .sqlite3).");
  }
  if (file.size === 0 || file.size > 25 * 1024 * 1024) {
    throw new Error("Database files must be between 1 byte and 25 MB.");
  }
  await fs.mkdir(uploadsDirectory, { recursive: true });
  const baseName = path.basename(file.name, extension).replace(/[^a-zA-Z0-9_-]/g, "-") || "database";
  const fileName = `${Date.now()}-${baseName}${extension}`;
  const filePath = path.join(uploadsDirectory, fileName);
  await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  return { name: fileName, path: filePath, size: file.size, isDefault: false };
}

export async function resolveDatabaseFile(name: string): Promise<DatabaseFile> {
  const databases = await listDatabaseFiles();
  const database = databases.find((item) => item.name === name);
  if (!database) throw new Error("The selected database is no longer available.");
  return database;
}
