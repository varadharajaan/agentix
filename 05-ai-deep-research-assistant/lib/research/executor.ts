import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { planResearch } from "./planner";
import { writeReport } from "./report";
import type { EmitFn, ResearchPlan, SourceItem } from "./types";

const MODEL = process.env.RESEARCH_MODEL ?? "gpt-5.1";

interface SubtopicFinding {
  subtopicId: string;
  title: string;
  summary: string;
}

/**
 * Runs the full deep-research workflow for one question, emitting a
 * `ResearchEvent` at every meaningful step so the UI can render live
 * progress. This ties together all six phases described in the project
 * spec: single search -> multi-subtopic search -> planning -> evidence
 * collection/dedup -> report generation -> streaming updates.
 */
export async function runDeepResearch(question: string, emit: EmitFn): Promise<void> {
  emit({
    type: "status",
    step: "planning",
    message: "Understanding the question and drafting a research plan",
  });

  const plan: ResearchPlan = await planResearch(question);
  emit({ type: "plan", plan });

  const allSources: SourceItem[] = [];
  const seenUrls = new Set<string>();
  const findings: SubtopicFinding[] = [];

  for (const subtopic of plan.subtopics) {
    emit({
      type: "status",
      step: "searching",
      subtopicId: subtopic.id,
      message: `Searching the web for "${subtopic.title}"`,
    });

    const result = await generateText({
      model: openai(MODEL),
      tools: {
        web_search: openai.tools.webSearch({ searchContextSize: "medium" }),
      },
      // Allow multiple search + read steps per subtopic before the model
      // has to produce its final written summary.
      stopWhen: stepCountIs(5),
      system: `You are a research analyst investigating a single subtopic of a
larger report. Use the web_search tool as many times as needed (try more than
one query if the first results are thin or one-sided) to find trustworthy,
current sources: official documentation, reputable news outlets, academic
papers, government data, and primary sources. Prefer sources published
recently when recency matters. After researching, write a dense, factual
summary of what you found - note where sources agree, where they disagree,
and call out anything important that you could not verify. Do not include a
references list yourself; sources are tracked separately.`,
      prompt: `Subtopic: ${subtopic.title}
What this subtopic needs to establish: ${subtopic.description}
Suggested starting queries: ${subtopic.queries.join(" | ")}

Research this subtopic and summarize your findings in 6-10 sentences.`,
    });

    emit({
      type: "status",
      step: "reading",
      subtopicId: subtopic.id,
      message: `Reading sources for "${subtopic.title}"`,
    });

    for (const source of result.sources ?? []) {
      if (source.sourceType !== "url") continue;
      if (seenUrls.has(source.url)) continue;
      seenUrls.add(source.url);

      const item: SourceItem = {
        id: `src${allSources.length + 1}`,
        title: source.title?.trim() || source.url,
        url: source.url,
        subtopicId: subtopic.id,
      };
      allSources.push(item);
      emit({ type: "source", source: item });
    }

    findings.push({
      subtopicId: subtopic.id,
      title: subtopic.title,
      summary: result.text,
    });

    emit({
      type: "subtopic-complete",
      subtopicId: subtopic.id,
      summary: result.text,
    });
  }

  emit({
    type: "status",
    step: "comparing",
    message: "Cross-checking findings and looking for gaps before writing the report",
  });

  emit({
    type: "status",
    step: "writing-report",
    message: "Synthesizing findings into a structured report",
  });

  const { report, citations } = await writeReport(plan, findings, allSources);

  emit({ type: "report", report, citations });
  emit({ type: "done" });
}
