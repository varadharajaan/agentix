import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/langgraph/graph";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { repoId } = await req.json();
    if (!repoId) {
      return NextResponse.json({ error: "repoId is required." }, { status: 400 });
    }

    const question =
      "Describe the application architecture: major components/modules, how they depend on and communicate with each other, data flow, and any notable design patterns.";

    const result = await runAgent(repoId, "architecture", question);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Architecture analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
