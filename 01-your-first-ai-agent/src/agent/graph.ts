import { createAgent } from "langchain";
import type { BaseMessage } from "@langchain/core/messages";
import { createChatModel } from "./model";
import { tools } from "./tools";

const SYSTEM_PROMPT = `You are a helpful, direct AI assistant built for a course on agentic AI engineering.

You have access to tools — use them whenever they'd give a more accurate or
up-to-date answer than your own knowledge (e.g. current weather, or any
arithmetic/calculation). Don't narrate that you're "going to use a tool";
just call it. After a tool returns, explain the result naturally.

Keep responses concise and well-formatted with markdown when helpful.`;

export function createChatAgent() {
  return createAgent({
    model: createChatModel(),
    tools: tools,
    systemPrompt: SYSTEM_PROMPT,
  });
}

export function streamAgent(messages: BaseMessage[]) {
  const agent = createChatAgent();
  return agent.stream({ messages }, { streamMode: ["messages", "tools"] });
}
