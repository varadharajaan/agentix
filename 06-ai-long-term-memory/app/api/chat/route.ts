import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { retrieveRelevantMemories } from "@/lib/memory/retrieval";
import type { ChatMessage } from "@/lib/memory/types";

export const runtime = "nodejs";

const MODEL = process.env.MEMORY_MODEL ?? "gpt-5.1";
// Single-user demo. Swap this for a real session/user id to support
// multiple users - the schema and every store function already take a
// userId, so nothing else needs to change.
const USER_ID = "local-user";

export async function POST(req: Request) {
  let body: { message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, history } = body;
  if (typeof message !== "string" || message.trim().length === 0) {
    return Response.json({ error: "`message` must be a non-empty string" }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OPENAI_API_KEY is not configured on the server" }, { status: 500 });
  }

  const priorMessages: ChatMessage[] = Array.isArray(history) ? history : [];

  // Retrieve before generating - relevant memories are woven into the
  // system prompt rather than the conversation itself, so the model can
  // use them without treating them as something the user just said.
  const relevant = await retrieveRelevantMemories(message, USER_ID);
  const memoryBlock = relevant.length
    ? relevant.map((m) => `- (${m.type}) ${m.content}`).join("\n")
    : "(no relevant memories yet - this may be a new user or topic)";

  const result = streamText({
    model: openai(MODEL),
    system: `You are a helpful personal AI assistant with long-term memory
about this user. Some memories relevant to their current message:

${memoryBlock}

Use this naturally to personalize your answer when it helps - don't recite
the memory list back verbatim, and don't call attention to the fact that you
"have memories" as a mechanism. Just respond the way someone who already
knew these things about the user would.`,
    messages: [
      ...priorMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: message },
    ],
  });

  return result.toTextStreamResponse();
}
