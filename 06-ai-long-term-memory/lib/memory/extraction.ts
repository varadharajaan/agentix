import { generateText, tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createMemory, deleteMemory, listMemories, updateMemory } from "./store";
import type { MemoryEvent } from "./types";

const MODEL = process.env.MEMORY_MODEL ?? "gpt-5.1";

/**
 * Phases 2, 4 & 5: automatically extract, update, and forget memories.
 *
 * Runs after a chat turn completes. The model is given the current memory
 * list (with ids) and the latest exchange, and can call `remember`,
 * `reviseMemory`, or `forget` as needed. It's explicitly told to prefer
 * updating an existing memory over creating a near-duplicate, and to only
 * store durable facts - not one-off questions or temporary context.
 */
export async function extractMemories(
  turn: { user: string; assistant: string },
  userId: string,
  emit: (event: MemoryEvent) => void
): Promise<void> {
  const existing = listMemories(userId);
  const existingBlock = existing.length
    ? existing
        .map((m) => `[${m.id}] (${m.type}, confidence: ${m.confidence}) ${m.content}`)
        .join("\n")
    : "(no memories stored yet)";

  const tools = {
    remember: tool({
      description:
        "Store a brand-new durable fact about the user that isn't already covered by an existing memory below.",
      inputSchema: z.object({
        type: z
          .enum(["preference", "goal", "project", "constraint"])
          .describe(
            "preference: likes/dislikes/tools/style. goal: something they're working toward. project: something they're building. constraint: a fixed requirement (tech stack, platform, etc.)"
          ),
        content: z
          .string()
          .describe(
            "A concise, durable, third-person statement, e.g. 'Prefers TypeScript over JavaScript' or 'Building an AI course'."
          ),
        confidence: z.enum(["low", "medium", "high"]).default("medium"),
      }),
      execute: async (input) => {
        const memory = await createMemory(input, userId);
        emit({ type: "operation", op: "create", memory });
        return { id: memory.id };
      },
    }),
    reviseMemory: tool({
      description:
        "Update an existing memory when new information supersedes it (e.g. the user switched frameworks). Prefer this over creating a duplicate.",
      inputSchema: z.object({
        id: z.string().describe("The id (in brackets) of the existing memory to update"),
        content: z.string().describe("The corrected or updated statement"),
        confidence: z.enum(["low", "medium", "high"]).optional(),
      }),
      execute: async ({ id, content, confidence }) => {
        const memory = await updateMemory(id, { content, confidence });
        if (memory) emit({ type: "operation", op: "update", memory });
        return { id, updated: Boolean(memory) };
      },
    }),
    forget: tool({
      description:
        "Permanently delete a memory that is outdated, incorrect, or that the user explicitly asked to be forgotten.",
      inputSchema: z.object({
        id: z.string().describe("The id (in brackets) of the memory to delete"),
        reason: z.string().optional(),
      }),
      execute: async ({ id }) => {
        const memory = deleteMemory(id);
        if (memory) emit({ type: "operation", op: "forget", memory });
        return { id, deleted: Boolean(memory) };
      },
    }),
  };

  await generateText({
    model: openai(MODEL),
    tools,
    stopWhen: stepCountIs(6),
    system: `You maintain a long-term memory store about a user, based on one
conversation turn at a time. You are not the chat assistant - the user never
sees your output directly, only the effects of the tools you call.

Only remember durable, useful facts: preferences, goals, projects, and fixed
constraints. Do NOT remember: one-off questions, temporary tasks, throwaway
calculations, or sensitive personal information the user hasn't clearly
volunteered as something to remember. Most turns will need zero tool calls -
that's expected and correct, not a failure.

Before creating a new memory, check whether it actually updates or replaces
one of the existing memories below - if so, call reviseMemory instead of
remember to avoid duplicates. If the user says something that directly
contradicts or invalidates an existing memory (e.g. "I don't use React
anymore"), call forget or reviseMemory rather than leaving stale information
in place.

Existing memories:
${existingBlock}`,
    prompt: `User said: "${turn.user}"
Assistant replied: "${turn.assistant}"

Decide what, if anything, should be remembered, updated, or forgotten as a
result of this exchange. Call tools as needed, or none at all.`,
  });

  emit({ type: "done", memories: listMemories(userId) });
}
