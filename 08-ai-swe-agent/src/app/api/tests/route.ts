import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/langgraph/graph";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { repoId, path } = await req.json();
    if (!repoId || !path) {
      return NextResponse.json({ error: "repoId and path are required." }, { status: 400 });
    }

    const question = `Write unit tests for ${path}. Cover the main behaviors and realistic edge cases.`;

    const result = await runAgent(repoId, "tests", question);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Test generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
