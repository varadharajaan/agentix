import type { NextRequest } from "next/server";
import { runDeepResearch } from "@/lib/research/executor";
import type { ResearchEvent } from "@/lib/research/types";

export const runtime = "nodejs";
// Deep research can take a couple of minutes across several subtopics.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let question: unknown;
  try {
    ({ question } = await req.json());
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof question !== "string" || question.trim().length < 3) {
    return Response.json(
      { error: "`question` must be a non-empty string" },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: ResearchEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        await runDeepResearch(question as string, emit);
      } catch (err) {
        emit({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown research error",
        });
      } finally {
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
