import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState, AgentStateType } from "./state";
import {
  understandRequest,
  searchAndRetrieve,
  analyzeContext,
  generateResponse,
} from "./nodes";
import { AgentMode, ChunkWithScore } from "../types";

/**
 * Assembles the analysis workflow:
 *
 *   START -> understandRequest -> searchAndRetrieve -> analyzeContext
 *         -> generateResponse -> END
 *
 * Every mode (chat, docs, review, tests, architecture) flows through the
 * same graph — only the final generation prompt differs per mode.
 */
const workflow = new StateGraph(AgentState)
  .addNode("understandRequest", understandRequest)
  .addNode("searchAndRetrieve", searchAndRetrieve)
  .addNode("analyzeContext", analyzeContext)
  .addNode("generateResponse", generateResponse)
  .addEdge(START, "understandRequest")
  .addEdge("understandRequest", "searchAndRetrieve")
  .addEdge("searchAndRetrieve", "analyzeContext")
  .addEdge("analyzeContext", "generateResponse")
  .addEdge("generateResponse", END);

export const analysisGraph = workflow.compile();

export interface RunAgentResult {
  answer: string;
  sources: { path: string; startLine: number; endLine: number; score: number }[];
}

export async function runAgent(
  repoId: string,
  mode: AgentMode,
  question: string
): Promise<RunAgentResult> {
  const result = (await analysisGraph.invoke({
    repoId,
    mode,
    question,
  })) as AgentStateType;

  return {
    answer: result.answer,
    sources: (result.retrievedChunks as ChunkWithScore[]).map((c) => ({
      path: c.path,
      startLine: c.startLine,
      endLine: c.endLine,
      score: c.score,
    })),
  };
}
