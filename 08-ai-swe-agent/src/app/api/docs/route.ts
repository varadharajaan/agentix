import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/langgraph/graph";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { repoId, path } = await req.json();
    if (!repoId) {
      return NextResponse.json({ error: "repoId is required." }, { status: 400 });
    }

    const question = path
      ? `Generate documentation for ${path}.`
      : "Generate a comprehensive README-style overview of this entire project: what it does, its architecture, key modules, and how to get started.";

    const result = await runAgent(repoId, "docs", question);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Documentation generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
