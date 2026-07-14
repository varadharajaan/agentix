import { ArtifactFile, SessionFile } from "@/types/types";
import fs from "fs/promises";
import path from "path";

export const DATA_ROOT = path.join(process.cwd(), "data");
export const SESSIONS_ROOT = path.join(DATA_ROOT, "sessions");

/** Only allow filesystem-safe session ids (uuid v4 by convention). */
const SESSION_ID_RE = /^[a-zA-Z0-9_-]{6,64}$/;

export function assertValidSessionId(sessionId: string) {
  if (!SESSION_ID_RE.test(sessionId)) {
    throw new Error("Invalid session id");
  }
}

/** Every file the session touches — uploaded or generated — lives here flat,
 *  so Python code can do e.g. pd.read_csv("sales.csv") with no path juggling. */
export function sessionDir(sessionId: string) {
  assertValidSessionId(sessionId);
  return path.join(SESSIONS_ROOT, sessionId, "files");
}

function manifestPath(sessionId: string) {
  return path.join(SESSIONS_ROOT, sessionId, "manifest.json");
}

interface Manifest {
  uploaded: string[];
}

async function readManifest(sessionId: string): Promise<Manifest> {
  try {
    const raw = await fs.readFile(manifestPath(sessionId), "utf-8");
    return JSON.parse(raw);
  } catch {
    return { uploaded: [] };
  }
}

async function writeManifest(sessionId: string, manifest: Manifest) {
  await fs.mkdir(path.dirname(manifestPath(sessionId)), { recursive: true });
  await fs.writeFile(
    manifestPath(sessionId),
    JSON.stringify(manifest, null, 2),
  );
}

export async function ensureSessionDir(sessionId: string) {
  const dir = sessionDir(sessionId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/** Record that `filename` arrived via upload (as opposed to being generated
 *  by executed code), so the file explorer can badge it correctly. */
export async function markUploaded(sessionId: string, filename: string) {
  const manifest = await readManifest(sessionId);
  if (!manifest.uploaded.includes(filename)) {
    manifest.uploaded.push(filename);
    await writeManifest(sessionId, manifest);
  }
}

export function classifyKind(filename: string): ArtifactFile["kind"] {
  const ext = path.extname(filename).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"].includes(ext))
    return "image";
  if (ext === ".csv" || ext === ".tsv") return "csv";
  if (ext === ".pdf") return "pdf";
  if (ext === ".xlsx" || ext === ".xls") return "excel";
  if (ext === ".json") return "json";
  if ([".txt", ".md", ".log"].includes(ext)) return "text";
  return "other";
}

/** Snapshot a directory's file -> mtimeMs map (flat, non-recursive). */
export async function snapshotDir(dir: string): Promise<Map<string, number>> {
  const snapshot = new Map<string, number>();
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const full = path.join(dir, entry.name);
      const stat = await fs.stat(full);
      snapshot.set(entry.name, stat.mtimeMs);
    }
  } catch {
    // directory may not exist yet
  }
  return snapshot;
}

/** Files that are new or modified between two snapshots. */
export function diffSnapshots(
  before: Map<string, number>,
  after: Map<string, number>,
): string[] {
  const changed: string[] = [];
  for (const [name, mtime] of after) {
    if (!before.has(name) || before.get(name) !== mtime) {
      changed.push(name);
    }
  }
  return changed;
}

export async function listSessionFiles(
  sessionId: string,
): Promise<SessionFile[]> {
  const dir = await ensureSessionDir(sessionId);
  const manifest = await readManifest(sessionId);
  const entries = await fs
    .readdir(dir, { withFileTypes: true })
    .catch(() => []);

  const result: SessionFile[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const stat = await fs.stat(path.join(dir, entry.name));
    result.push({
      name: entry.name,
      url: `/api/files/${sessionId}/${encodeURIComponent(entry.name)}`,
      sizeBytes: stat.size,
      origin: manifest.uploaded.includes(entry.name) ? "uploaded" : "generated",
      kind: classifyKind(entry.name),
    });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function toArtifactFile(
  sessionId: string,
  filename: string,
  sizeBytes: number,
): ArtifactFile {
  return {
    name: filename,
    path: filename,
    url: `/api/files/${sessionId}/${encodeURIComponent(filename)}`,
    kind: classifyKind(filename),
    sizeBytes,
  };
}
