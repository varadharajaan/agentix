import { ChatOpenAI } from "@langchain/openai";

export function createChatModel() {
  return new ChatOpenAI({
    model: process.env.OPENAI_MODEL ?? "gpt-5.5-mini",
    temperature: 0.4,
    apiKey: process.env.OPENAI_API_KEY,
    configuration: process.env.OPENAI_BASE_URL
      ? { baseURL: process.env.OPENAI_BASE_URL }
      : undefined,
    streaming: true,
  });
}
