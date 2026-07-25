import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const files = db
    .prepare(
      `SELECT id, path, language, lines, size_bytes FROM files WHERE repo_id = ? ORDER BY path`
    )
    .all(id) as {
    id: string;
    path: string;
    language: string;
    lines: number;
    size_bytes: number;
  }[];

  return NextResponse.json({
    files: files.map((f) => ({
      id: f.id,
      path: f.path,
      language: f.language,
      lines: f.lines,
      sizeBytes: f.size_bytes,
    })),
  });
}
