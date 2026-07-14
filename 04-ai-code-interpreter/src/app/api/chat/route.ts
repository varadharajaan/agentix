import { NextRequest } from "next/server";
import { runAgent } from "@/lib/agent";
import { assertValidSessionId } from "@/lib/fs-utils";
import { TimelineStep } from "@/types/types";

export const maxDuration = 60;

interface ChatRequestBody {
  sessionId: string;
  prompt: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

/**
 * Streams newline-delimited JSON events so the UI can render the execution
 * timeline live instead of waiting for the whole agent run to finish:
 *   {"type":"timeline","timeline":[...]}   — zero or more
 *   {"type":"result","result":{...}}       — exactly one, always last
 *   {"type":"fatal","error":"..."}         — instead of "result" on hard failure
 */
export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
    });
  }

  const { sessionId, prompt, history } = body;
  if (!sessionId || !prompt?.trim()) {
    return new Response(
      JSON.stringify({ error: "sessionId and prompt are required" }),
      {
        status: 400,
      },
    );
  }

  try {
    assertValidSessionId(sessionId);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid session id" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        const result = await runAgent({
          sessionId,
          prompt,
          history,
          onTimelineUpdate: (timeline: TimelineStep[]) =>
            send({ type: "timeline", timeline }),
        });
        send({ type: "result", result });
      } catch (err) {
        send({
          type: "fatal",
          error:
            err instanceof Error
              ? err.message
              : "Unknown error running the agent",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "Transfer-Encoding": "chunked",
    },
  });
}
