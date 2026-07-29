import { EMBEDDING_MODEL, openai } from "@/lib/ai/openai";

// OpenAI batches embedding requests server-side; we still chunk client-side
// requests to stay well under the model's input-array limits.
const BATCH_SIZE = 96;

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    vectors.push(...response.data.map((d) => d.embedding));
  }

  return vectors;
}

export async function embedText(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  return vector;
}
