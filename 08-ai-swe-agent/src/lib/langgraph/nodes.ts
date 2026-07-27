import { db } from "../db";
import { searchRepository } from "../similarity";
import { getOpenAI, CHAT_MODEL } from "../openai";
import { AgentStateType } from "./state";

const MODE_INSTRUCTIONS: Record<string, string> = {
  chat:
    "Answer the developer's question about this codebase clearly and precisely. Reference specific files and line ranges from the provided context when relevant.",
  docs:
    "Write clear, well-organized documentation (Markdown) based on the provided code context. Include an overview, key modules, and how the pieces fit together. Only document what is actually shown in the context.",
  review:
    "Perform a code review of the provided context. Call out concrete issues (bugs, edge cases, style, security, performance), organized by severity. Be specific about file names and line numbers. If something looks fine, say so briefly rather than inventing problems.",
  tests:
    "Write unit tests for the provided code context, using a testing framework appropriate to the language shown (e.g. Jest/Vitest for TS/JS, pytest for Python). Cover the main behaviors and realistic edge cases. Output runnable code in a fenced code block.",
  architecture:
    "Describe the overall architecture implied by the provided code context: major components, how they depend on each other, data flow, and notable design patterns. Organize the answer with clear headings.",
};

/** Node 1: Understand Request — classify intent and pull out a target file path if the user named one. */
export async function understandRequest(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  // Very light heuristic extraction of a path mention like "in src/lib/auth.ts"
  const pathMatch = state.question.match(
    /([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/
  );
  const targetPath =
    pathMatch && pathMatch[1].includes("/") ? pathMatch[1] : pathMatch?.[1] ?? null;

  return {
    targetPath,
    searchQuery: state.question,
  };
}

/** Node 2 + 3: Search Repository / Retrieve Relevant Code. */
export async function searchAndRetrieve(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const chunks = await searchRepository(state.repoId, state.searchQuery, 10, {
    pathFilter: state.targetPath ?? undefined,
  });

  // If filtering by the guessed path returned nothing (bad guess), fall back
  // to an unfiltered semantic search so we never come back empty-handed.
  if (chunks.length === 0 && state.targetPath) {
    const fallback = await searchRepository(state.repoId, state.searchQuery, 10);
    return { retrievedChunks: fallback };
  }

  return { retrievedChunks: chunks };
}

/** Node 4: Analyze Context — build a compact, labeled context block for the LLM prompt. */
export async function analyzeContext(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const repo = db
    .prepare(`SELECT name, file_count, total_lines FROM repositories WHERE id = ?`)
    .get(state.repoId) as { name: string; file_count: number; total_lines: number } | undefined;

  const header = repo
    ? `Repository: ${repo.name} (${repo.file_count} files, ${repo.total_lines} lines indexed)\n\n`
    : "";

  const contextSummary =
    header +
    state.retrievedChunks
      .map(
        (c, i) =>
          `--- Source ${i + 1}: ${c.path} (lines ${c.startLine}-${c.endLine}${
            c.symbol ? `, in ${c.symbol}` : ""
          }) [relevance ${(c.score * 100).toFixed(0)}%] ---\n${c.content}`
      )
      .join("\n\n");

  return { contextSummary };
}

/** Node 5: Generate Documentation / Review / Explanation. */
export async function generateResponse(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const openai = getOpenAI();
  const instruction = MODE_INSTRUCTIONS[state.mode] ?? MODE_INSTRUCTIONS.chat;

  const res = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an AI software engineering agent that has indexed an entire code repository via retrieval-augmented generation. " +
          "You only know what is in the provided context — never invent files, functions, or behavior that isn't shown. " +
          "If the context doesn't contain enough information to answer confidently, say so plainly. " +
          instruction,
      },
      {
        role: "user",
        content: `Retrieved context from the repository:\n\n${state.contextSummary || "(no matching code found)"}\n\nRequest:\n${state.question}`,
      },
    ],
  });

  return { answer: res.choices[0]?.message?.content ?? "" };
}
