import { CHAT_MODEL, openai } from "@/lib/ai/openai";
import { semanticSearch } from "@/lib/ai/similarity";
import type { Citation } from "@/lib/types";

import type { GraphStateType, QuestionIntent } from "@/lib/graph/state";

// ---- 1. Understand intent -------------------------------------------------
// Cheap keyword heuristics first (instant, free); only a genuinely
// ambiguous question falls through to an LLM classification call.
const COMPARISON_HINTS = /\bcompar|difference|changed|versus|vs\.?\b/i;
const SUMMARY_HINTS = /\bsummar|overview|tl;?dr|executive summary\b/i;
const EXTRACTION_HINTS = /\bextract|list all|every (email|invoice|date|amount|number)\b/i;
const SEARCH_HINTS = /\bfind (every|all)|every mention of|search for\b/i;

export async function understandIntent(
  state: GraphStateType
): Promise<Partial<GraphStateType>> {
  const { question, documentIds } = state;

  let intent: QuestionIntent = "qa";
  if (COMPARISON_HINTS.test(question) || documentIds.length > 1) intent = "comparison";
  else if (SUMMARY_HINTS.test(question)) intent = "summary";
  else if (EXTRACTION_HINTS.test(question)) intent = "extraction";
  else if (SEARCH_HINTS.test(question)) intent = "search";

  return { intent };
}

// ---- 2. Retrieve relevant chunks ------------------------------------------
export async function retrieveDocuments(
  state: GraphStateType
): Promise<Partial<GraphStateType>> {
  const { question, documentIds, intent } = state;

  // Comparisons and summaries benefit from broader coverage per document;
  // straight Q&A can stay narrow and precise.
  const topK = intent === "comparison" || intent === "summary" ? 12 : 8;

  const retrievedChunks = await semanticSearch(question, {
    documentIds: documentIds.length > 0 ? documentIds : undefined,
    topK,
  });

  return { retrievedChunks };
}

// ---- 3. Generate the final response ---------------------------------------
function buildContext(state: GraphStateType): string {
  return state.retrievedChunks
    .map((r, i) => {
      const pageLabel = r.chunk.pageNumber ? `, page ${r.chunk.pageNumber}` : "";
      return `[Source ${i + 1}: ${r.document.filename}${pageLabel}]\n${r.chunk.content}`;
    })
    .join("\n\n---\n\n");
}

const INTENT_INSTRUCTIONS: Record<QuestionIntent, string> = {
  qa: "Answer the question directly and concisely using only the provided sources.",
  comparison:
    "Compare the documents. Call out what was added, removed, or changed, referencing sources for each point.",
  summary: "Produce a clear, well-organized summary of the material.",
  extraction:
    "Extract the requested information as a clean list. If nothing matches, say so plainly.",
  search: "List every relevant occurrence found in the sources, with the source it came from.",
};

export async function generateResponse(
  state: GraphStateType
): Promise<Partial<GraphStateType>> {
  const { question, retrievedChunks, intent, conversationHistory } = state;

  if (retrievedChunks.length === 0) {
    return {
      answer:
        "I couldn't find anything relevant in the uploaded documents to answer that. Try rephrasing, or upload a document that covers this topic.",
      citations: [],
    };
  }

  const context = buildContext(state);

  const systemPrompt = `You are a document intelligence assistant. You answer questions ONLY using the provided source excerpts — never from outside knowledge. Always ground claims in the sources and reference them as [Source N]. ${INTENT_INSTRUCTIONS[intent]}`;

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((m) => ({ role: m.role, content: m.content }) as const),
      {
        role: "user",
        content: `Sources:\n\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  const answer = response.choices[0]?.message?.content ?? "";

  const citations: Citation[] = retrievedChunks.map((r) => ({
    documentId: r.document.id,
    filename: r.document.filename,
    page: r.chunk.pageNumber,
    chunkId: r.chunk.id,
    snippet: r.chunk.content.slice(0, 240),
  }));

  return { answer, citations };
}
