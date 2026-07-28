import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { addMessage, createConversation, getMessages } from "@/lib/db/conversations";
import { runDocumentIntelligenceGraph } from "@/lib/graph/workflow";

export const runtime = "nodejs";

const requestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
  documentIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { message, documentIds } = parsed.data;

  const conversation =
    parsed.data.conversationId != null
      ? { id: parsed.data.conversationId }
      : createConversation(message.slice(0, 60));

  const priorMessages = getMessages(conversation.id);
  const conversationHistory = priorMessages.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  addMessage({ conversationId: conversation.id, role: "user", content: message });

  const result = await runDocumentIntelligenceGraph({
    question: message,
    documentIds,
    conversationHistory,
  });

  const assistantMessage = addMessage({
    conversationId: conversation.id,
    role: "assistant",
    content: result.answer,
    citations: result.citations,
  });

  return NextResponse.json({
    conversationId: conversation.id,
    message: assistantMessage,
    intent: result.intent,
  });
}
