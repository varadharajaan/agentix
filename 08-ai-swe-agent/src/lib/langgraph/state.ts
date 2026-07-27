import { Annotation } from "@langchain/langgraph";
import { ChunkWithScore, AgentMode } from "../types";

/**
 * Shared state threaded through every node of the analysis graph:
 * User Question -> Understand Request -> Search Repository ->
 * Retrieve Relevant Code -> Analyze Context -> Generate Response.
 */
export const AgentState = Annotation.Root({
  repoId: Annotation<string>(),
  mode: Annotation<AgentMode>(),
  question: Annotation<string>(),
  targetPath: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  searchQuery: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  retrievedChunks: Annotation<ChunkWithScore[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  contextSummary: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  answer: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
});

export type AgentStateType = typeof AgentState.State;
