import { Annotation } from "@langchain/langgraph";

import type { Citation, RetrievedChunk } from "@/lib/types";

export type QuestionIntent = "qa" | "comparison" | "summary" | "extraction" | "search";

// The shared state threaded through every node in the graph. Each key
// declares how updates from a node are merged into the running state —
// plain "last write wins" for scalars, and array concatenation where a
// history is useful.
export const GraphState = Annotation.Root({
  question: Annotation<string>(),
  documentIds: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  conversationHistory: Annotation<{ role: "user" | "assistant"; content: string }[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  intent: Annotation<QuestionIntent>({
    reducer: (_prev, next) => next,
    default: () => "qa",
  }),
  retrievedChunks: Annotation<RetrievedChunk[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  answer: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
  citations: Annotation<Citation[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
});

export type GraphStateType = typeof GraphState.State;
