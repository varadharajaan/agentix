import { StateGraph, END, START } from "@langchain/langgraph";

import { GraphState, type GraphStateType } from "@/lib/graph/state";
import { generateResponse, retrieveDocuments, understandIntent } from "@/lib/graph/nodes";

// User Question -> Understand Intent -> Retrieve Documents
//   -> (comparison? retrieve broader / already handled by topK) -> Analyze -> Response
//
// The "Need Comparison?" branch from the spec is folded into
// retrieveDocuments (which widens topK and spans all selected documents)
// and into the response prompt (which switches instructions by intent).
// The explicit branch below is kept so the routing is visible and easy to
// extend — e.g. to send comparisons through a dedicated multi-document
// analysis node later.
function routeAfterRetrieval(_state: GraphStateType): "generateResponse" {
  return "generateResponse";
}

const graph = new StateGraph(GraphState)
  .addNode("understandIntent", understandIntent)
  .addNode("retrieveDocuments", retrieveDocuments)
  .addNode("generateResponse", generateResponse)
  .addEdge(START, "understandIntent")
  .addEdge("understandIntent", "retrieveDocuments")
  .addConditionalEdges("retrieveDocuments", routeAfterRetrieval, {
    generateResponse: "generateResponse",
  })
  .addEdge("generateResponse", END);

export const documentIntelligenceGraph = graph.compile();

export async function runDocumentIntelligenceGraph(input: {
  question: string;
  documentIds?: string[];
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}): Promise<GraphStateType> {
  const result = await documentIntelligenceGraph.invoke({
    question: input.question,
    documentIds: input.documentIds ?? [],
    conversationHistory: input.conversationHistory ?? [],
  });

  return result;
}
