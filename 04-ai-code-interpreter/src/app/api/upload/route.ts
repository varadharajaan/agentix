import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  ensureSessionDir,
  listSessionFiles,
  markUploaded,
} from "@/lib/fs-utils";

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB per file
const ALLOWED_EXT = new Set([
  ".csv",
  ".tsv",
  ".xlsx",
  ".xls",
  ".json",
  ".txt",
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
]);

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const sessionId = form.get("sessionId");
  if (typeof sessionId !== "string" || !sessionId) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 },
    );
  }

  const dir = await ensureSessionDir(sessionId);
  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const saved: string[] = [];
  const rejected: { name: string; reason: string }[] = [];

  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      rejected.push({
        name: file.name,
        reason: `unsupported file type ${ext || "(none)"}`,
      });
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      rejected.push({ name: file.name, reason: "exceeds 25MB limit" });
      continue;
    }

    // Sanitize filename: strip path separators, keep it flat in the session dir.
    const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, safeName), bytes);
    await markUploaded(sessionId, safeName);
    saved.push(safeName);
  }

  const currentFiles = await listSessionFiles(sessionId);
  return NextResponse.json({ saved, rejected, files: currentFiles });
}
