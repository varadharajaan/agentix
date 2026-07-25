import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Repository } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const r = db
    .prepare(
      `SELECT id, name, file_count, chunk_count, total_lines, status, error, created_at
       FROM repositories WHERE id = ?`
    )
    .get(id) as
    | {
        id: string;
        name: string;
        file_count: number;
        chunk_count: number;
        total_lines: number;
        status: string;
        error: string | null;
        created_at: string;
      }
    | undefined;

  if (!r) {
    return NextResponse.json({ error: "Repository not found." }, { status: 404 });
  }

  const repo: Repository = {
    id: r.id,
    name: r.name,
    fileCount: r.file_count,
    chunkCount: r.chunk_count,
    totalLines: r.total_lines,
    status: r.status as Repository["status"],
    error: r.error,
    createdAt: r.created_at,
  };

  return NextResponse.json({ repo });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.prepare(`DELETE FROM repositories WHERE id = ?`).run(id);
  return NextResponse.json({ ok: true });
}
