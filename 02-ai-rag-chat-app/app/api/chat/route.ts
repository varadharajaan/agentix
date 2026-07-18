import type { Document } from "@langchain/core/documents";
import { buildRagGraph } from "@/lib/rag/graph";
import type { ChatEvent, ChatTurn, RetrievedSource } from "@/lib/rag/types";

export const runtime = "nodejs";
export const maxDuration = 120;

function toSources(docs: Document[]): RetrievedSource[] {
  return docs.map((d, i) => ({
    index: i + 1,
    documentId: String(d.metadata.documentId),
    documentTitle: String(d.metadata.documentTitle),
    chunkIndex: Number(d.metadata.chunkIndex),
    snippet: d.pageContent.length > 320 ? `${d.pageContent.slice(0, 320)}…` : d.pageContent,
  }));
}

export async function POST(req: Request) {
  let body: { question?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { question, history } = body;
  if (typeof question !== "string" || question.trim().length === 0) {
    return Response.json({ error: "`question` must be a non-empty string" }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OPENAI_API_KEY is not configured on the server" }, { status: 500 });
  }

  const chatHistory: ChatTurn[] = Array.isArray(history) ? history : [];
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: ChatEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        emit({ type: "status", step: "retrieving", message: "Searching the knowledge base" });

        const graph = buildRagGraph();

        // Token-level streaming is captured via a LangChain callback
        // handler rather than the graph's own state - `generate`'s
        // ChatOpenAI call has `streaming: true`, so handleLLMNewToken
        // fires per token regardless of whether the node itself is
        // invoked or streamed.
        const tokenHandler = {
          handleLLMNewToken(token: string) {
            if (token) emit({ type: "token", text: token });
          },
        };

        let finalAnswer = "";
        const nodeStream = await graph.stream(
          { question, history: chatHistory },
          { streamMode: "updates", callbacks: [tokenHandler] }
        );

        for await (const update of nodeStream) {
          if ("retrieve" in update) {
            const docs = (update.retrieve?.context ?? []) as Document[];
            emit({ type: "sources", sources: toSources(docs) });
            emit({ type: "status", step: "generating", message: "Writing a grounded answer" });
          }
          if ("generate" in update) {
            finalAnswer = (update.generate?.answer ?? "") as string;
          }
        }

        emit({ type: "done", answer: finalAnswer });
      } catch (err) {
        emit({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error while answering",
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
