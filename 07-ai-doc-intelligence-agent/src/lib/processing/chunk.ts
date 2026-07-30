export interface TextChunk {
  content: string;
  pageNumber?: number | null;
}

export interface ChunkOptions {
  /** Target chunk size in characters (roughly ~4 chars/token). */
  chunkSize?: number;
  /** Overlap between consecutive chunks, in characters. */
  chunkOverlap?: number;
}

const DEFAULTS: Required<ChunkOptions> = {
  chunkSize: 1200,
  chunkOverlap: 150,
};

/**
 * Splits text into overlapping chunks, preferring to break on paragraph
 * or sentence boundaries so retrieved chunks stay coherent.
 */
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { chunkSize, chunkOverlap } = { ...DEFAULTS, ...options };
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current.trim().length > 0) chunks.push(current.trim());
    current = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > chunkSize) {
      // Paragraph itself is too large — split on sentences.
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if ((current + " " + sentence).length > chunkSize) {
          pushCurrent();
        }
        current += (current ? " " : "") + sentence;
      }
      continue;
    }

    if ((current + "\n\n" + paragraph).length > chunkSize) {
      pushCurrent();
    }
    current += (current ? "\n\n" : "") + paragraph;
  }
  pushCurrent();

  if (chunkOverlap <= 0 || chunks.length <= 1) return chunks;

  // Apply a trailing overlap from the previous chunk to each chunk after
  // the first, so retrieval near chunk boundaries doesn't lose context.
  return chunks.map((chunk, i) => {
    if (i === 0) return chunk;
    const prev = chunks[i - 1];
    const overlap = prev.slice(Math.max(0, prev.length - chunkOverlap));
    return `${overlap}\n\n${chunk}`;
  });
}

/**
 * Chunk text that's already split by page (e.g. PDF extraction), tagging
 * each resulting chunk with the page it came from.
 */
export function chunkPages(
  pages: { pageNumber: number; text: string }[],
  options: ChunkOptions = {}
): TextChunk[] {
  const result: TextChunk[] = [];
  for (const page of pages) {
    const pieces = chunkText(page.text, options);
    for (const content of pieces) {
      result.push({ content, pageNumber: page.pageNumber });
    }
  }
  return result;
}
