import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { CitationItem, ResearchPlan, SourceItem } from "./types";

const MODEL = process.env.RESEARCH_MODEL ?? "gpt-5.1";

interface SubtopicFinding {
  subtopicId: string;
  title: string;
  summary: string;
}

/**
 * Phase 5: Report generation with structured sections and references.
 *
 * Takes the plan, the per-subtopic findings, and the deduplicated source
 * list, and asks the model to synthesize a single cited markdown report.
 * Sources are numbered up front so the model can only cite what it was
 * actually given - it never invents references.
 */
export async function writeReport(
  plan: ResearchPlan,
  findings: SubtopicFinding[],
  sources: SourceItem[]
): Promise<{ report: string; citations: CitationItem[] }> {
  const citations: CitationItem[] = sources.map((s, i) => ({ ...s, index: i + 1 }));

  const sourceList = citations
    .map((c) => `[${c.index}] ${c.title} — ${c.url}`)
    .join("\n");

  const findingsBlock = findings
    .map((f) => `### ${f.title}\n${f.summary}`)
    .join("\n\n");

  const { text: report } = await generateText({
    model: openai(MODEL),
    system: `You are the report-writing stage of a deep research agent. Write
a complete markdown research report from the findings and numbered source
list you're given. Rules:
- Cite claims inline using the given numbers, like [1] or [2][5]. Only use
  numbers that appear in the source list. Never invent a source.
- Do not fabricate facts that aren't supported by the findings provided.
- Be specific and analytical, not generic - reference concrete facts, figures,
  names, and dates from the findings wherever they appear.
- If sources disagree or information is missing, say so plainly in
  "Limitations" rather than glossing over it.`,
    prompt: `Research objective: ${plan.objective}

Findings by subtopic:
${findingsBlock}

Numbered sources (cite these by number, do not restate the URLs inline):
${sourceList}

Write the full report in markdown with exactly these top-level sections, in
this order:
# <Report Title>
## Executive Summary
## Research Objectives
## Key Findings
## Detailed Analysis
## Supporting Evidence
## Limitations
## Conclusion
## References

The References section must list every numbered source exactly once, as
markdown links, in numeric order, e.g. "1. [Title](https://example.com)".`,
  });

  return { report, citations };
}
