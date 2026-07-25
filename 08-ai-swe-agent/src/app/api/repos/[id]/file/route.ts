import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const path = req.nextUrl.searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing ?path=" }, { status: 400 });
  }

  const file = db
    .prepare(`SELECT path, language, content FROM files WHERE repo_id = ? AND path = ?`)
    .get(id, path) as { path: string; language: string; content: string } | undefined;

  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  return NextResponse.json({ file });
}
