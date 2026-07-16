import { createAgent } from "langchain";

import { createSQLAgentTools } from "../tools";
import { getSystemPrompt } from "./prompts";
import { model } from "./model";

export async function createSQLAgent(databasePath?: string) {
  const agent = createAgent({
    model,
    tools: createSQLAgentTools(databasePath),
    systemPrompt: await getSystemPrompt(),
  });
  return agent;
}
