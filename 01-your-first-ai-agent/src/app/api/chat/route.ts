import { streamAgent } from "@/agent/graph";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, type UIMessage } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const langchainMessages = await toBaseMessages(messages);
  const stream = await streamAgent(langchainMessages);
  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
