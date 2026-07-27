import { getOpenAI, EMBEDDING_MODEL } from "./openai";

const BATCH_SIZE = 96; // stay comfortably under OpenAI's per-request item limit

/**
 * Generates embeddings for a list of text chunks, batching requests so a
 * 620-file repo doesn't turn into one embedding call per chunk.
 */
export async function embedTexts(
  texts: string[],
  onProgress?: (done: number, total: number) => void
): Promise<number[][]> {
  const openai = getOpenAI();
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    for (const item of res.data) vectors.push(item.embedding);
    onProgress?.(Math.min(i + batch.length, texts.length), texts.length);
  }

  return vectors;
}

export async function embedQuery(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}
