import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    "[ai/openai] OPENAI_API_KEY is not set. Copy .env.example to .env.local and add your key."
  );
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-5.5";
export const EMBEDDING_MODEL = "text-embedding-3-small";
