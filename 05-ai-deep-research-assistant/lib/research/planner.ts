import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { ResearchPlan } from "./types";

const MODEL = process.env.RESEARCH_MODEL ?? "gpt-5.1";

const planSchema = z.object({
  objective: z
    .string()
    .describe(
      "A single sentence restating what the research ultimately needs to establish or answer."
    ),
  subtopics: z
    .array(
      z.object({
        title: z.string().describe("Short, human-readable subtopic title"),
        description: z
          .string()
          .describe("What this subtopic needs to find out, in 1-2 sentences"),
        queries: z
          .array(z.string())
          .min(1)
          .max(3)
          .describe("Specific, high-signal web search queries for this subtopic"),
      })
    )
    .min(2)
    .max(5)
    .describe("2-5 non-overlapping subtopics that together cover the question"),
});

/**
 * Phase 3: Automatic research planning and task decomposition.
 *
 * The agent never searches immediately. It first decides what it needs to
 * know, what topics to break the question into, and what queries would
 * surface trustworthy information for each one.
 */
export async function planResearch(question: string): Promise<ResearchPlan> {
  const { output } = await generateText({
    model: openai(MODEL),
    output: Output.object({
      schema: planSchema,
    }),
    system: `You are the planning stage of a deep research agent. Given a research
question, decompose it into 2-5 focused, non-overlapping subtopics that together
give a complete picture. For each subtopic, write specific web search queries
that would surface authoritative, current sources (official docs, reputable
news, academic papers, government data, primary sources) rather than generic
overview pages. Do not try to answer the question yourself - only plan.`,
    prompt: question,
  });

  return {
    objective: output.objective,
    subtopics: output.subtopics.map((s, i) => ({
      id: `s${i + 1}`,
      ...s,
    })),
  };
}
