import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Repository } from "@/lib/types";

export async function GET() {
  const rows = db
    .prepare(
      `SELECT id, name, file_count, chunk_count, total_lines, status, error, created_at
       FROM repositories ORDER BY created_at DESC`
    )
    .all() as {
    id: string;
    name: string;
    file_count: number;
    chunk_count: number;
    total_lines: number;
    status: string;
    error: string | null;
    created_at: string;
  }[];

  const repos: Repository[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    fileCount: r.file_count,
    chunkCount: r.chunk_count,
    totalLines: r.total_lines,
    status: r.status as Repository["status"],
    error: r.error,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ repos });
}
