import { extractMemories } from "@/lib/memory/extraction";
import type { MemoryEvent } from "@/lib/memory/types";

export const runtime = "nodejs";

// Single-user demo - see app/api/chat/route.ts for notes on multi-user support.
const USER_ID = "local-user";

export async function POST(req: Request) {
  let body: { user?: unknown; assistant?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { user, assistant } = body;
  if (typeof user !== "string" || typeof assistant !== "string") {
    return Response.json(
      { error: "`user` and `assistant` must both be strings" },
      { status: 400 }
    );
  }
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OPENAI_API_KEY is not configured on the server" }, { status: 500 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: MemoryEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        await extractMemories({ user, assistant }, USER_ID, emit);
      } catch (err) {
        emit({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown memory extraction error",
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
