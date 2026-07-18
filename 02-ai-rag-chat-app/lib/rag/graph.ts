import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { Document } from "@langchain/core/documents";
import { getVectorStore } from "./vectorstore";
import type { ChatTurn } from "./types";

const MODEL = process.env.RAG_CHAT_MODEL ?? "gpt-5.1";
const TOP_K = 5;

const RagState = Annotation.Root({
  question: Annotation<string>,
  history: Annotation<ChatTurn[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  context: Annotation<Document[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),
  answer: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
});

type RagStateType = typeof RagState.State;

/** Phase 5: retrieve relevant chunks via semantic similarity search. */
async function retrieve(state: RagStateType) {
  const store = await getVectorStore();
  const retriever = store.asRetriever({ k: TOP_K });
  const docs = await retriever.invoke(state.question);
  return { context: docs };
}

function formatContext(docs: Document[]): string {
  if (docs.length === 0) return "(no relevant document chunks were found in the knowledge base)";
  return docs
    .map(
      (d, i) =>
        `[${i + 1}] Source: ${d.metadata.documentTitle} (chunk ${Number(d.metadata.chunkIndex) + 1})\n${d.pageContent}`
    )
    .join("\n\n---\n\n");
}

function toLangchainMessages(history: ChatTurn[]) {
  return history.map((m) =>
    m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
  );
}

/** Phase 6: build a retrieval-aware prompt and generate a grounded answer. */
async function generate(state: RagStateType) {
  const model = new ChatOpenAI({ model: MODEL, streaming: true });

  const systemPrompt = `You are a helpful assistant that answers questions using ONLY
the retrieved document excerpts below - never your own outside knowledge. Cite
excerpts inline using their bracketed numbers, like [1] or [2][3]. If the
excerpts don't contain enough information to answer, say so plainly instead
of guessing.

Retrieved excerpts:
${formatContext(state.context)}`;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    ...toLangchainMessages(state.history),
    new HumanMessage(state.question),
  ]);

  const answer = typeof response.content === "string" ? response.content : String(response.content);
  return { answer };
}

/**
 * Phases 5 & 6: LangGraph controls the order of retrieval and generation.
 * Token-level streaming is captured via a callback handler passed at
 * invocation time (see app/api/chat/route.ts) rather than through graph
 * state, since only the final answer needs to persist in state - the
 * tokens themselves are a side channel straight to the HTTP response.
 */
export function buildRagGraph() {
  return new StateGraph(RagState)
    .addNode("retrieve", retrieve)
    .addNode("generate", generate)
    .addEdge(START, "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", END)
    .compile();
}
