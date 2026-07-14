import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { assertValidSessionId, sessionDir } from "@/lib/fs-utils";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".csv": "text/csv",
  ".tsv": "text/tab-separated-values",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".txt": "text/plain",
  ".md": "text/markdown",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string; filename: string }> },
) {
  const { sessionId, filename } = await params;

  try {
    assertValidSessionId(sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  // Guard against path traversal — only a bare filename is ever allowed.
  const safeName = path.basename(decodeURIComponent(filename));
  if (safeName !== decodeURIComponent(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(sessionDir(sessionId), safeName);

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
