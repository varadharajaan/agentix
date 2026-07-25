import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { runAgent } from "@/lib/langgraph/graph";

export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const repoId = req.nextUrl.searchParams.get("repoId");
  if (!repoId) {
    return NextResponse.json({ error: "repoId is required." }, { status: 400 });
  }

  const rows = db
    .prepare(
      `SELECT id, role, content, sources, created_at FROM chat_messages WHERE repo_id = ? ORDER BY created_at ASC`
    )
    .all(repoId) as {
    id: string;
    role: string;
    content: string;
    sources: string | null;
    created_at: string;
  }[];

  return NextResponse.json({
    messages: rows.map((r) => ({
      id: r.id,
      repoId,
      role: r.role,
      content: r.content,
      sources: r.sources ? JSON.parse(r.sources) : undefined,
      createdAt: r.created_at,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { repoId, message } = await req.json();
    if (!repoId || !message) {
      return NextResponse.json(
        { error: "repoId and message are required." },
        { status: 400 }
      );
    }

    db.prepare(
      `INSERT INTO chat_messages (id, repo_id, role, content) VALUES (?, ?, 'user', ?)`
    ).run(nanoid(10), repoId, message);

    const result = await runAgent(repoId, "chat", message);

    db.prepare(
      `INSERT INTO chat_messages (id, repo_id, role, content, sources) VALUES (?, ?, 'assistant', ?, ?)`
    ).run(nanoid(10), repoId, result.answer, JSON.stringify(result.sources));

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
