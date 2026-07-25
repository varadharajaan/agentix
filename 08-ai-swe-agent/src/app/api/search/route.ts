import { NextRequest, NextResponse } from "next/server";
import { searchRepository } from "@/lib/similarity";

export async function POST(req: NextRequest) {
  try {
    const { repoId, query, topK } = await req.json();

    if (!repoId || !query) {
      return NextResponse.json(
        { error: "repoId and query are required." },
        { status: 400 }
      );
    }

    const results = await searchRepository(repoId, query, topK ?? 12);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
