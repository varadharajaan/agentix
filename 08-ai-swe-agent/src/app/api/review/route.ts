import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/langgraph/graph";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { repoId, path, focus } = await req.json();
    if (!repoId || !path) {
      return NextResponse.json({ error: "repoId and path are required." }, { status: 400 });
    }

    const question = focus
      ? `Review ${path}, focusing specifically on: ${focus}.`
      : `Review ${path} and suggest improvements. Look for bugs, edge cases, and readability issues.`;

    const result = await runAgent(repoId, "review", question);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Review failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
