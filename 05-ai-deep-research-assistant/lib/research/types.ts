/**
 * Shared types for the Deep Research pipeline.
 *
 * The pipeline (see executor.ts) emits a stream of `ResearchEvent`s as it
 * works through: plan -> per-subtopic search/read/extract -> report.
 * The API route (app/api/research/route.ts) serializes these as NDJSON,
 * and the client (hooks/use-research.ts) parses them back into UI state.
 */

export type ResearchStep =
  | "planning"
  | "searching"
  | "reading"
  | "comparing"
  | "writing-report";

export interface ResearchSubtopic {
  id: string;
  title: string;
  description: string;
  queries: string[];
}

export interface ResearchPlan {
  objective: string;
  subtopics: ResearchSubtopic[];
}

export interface SourceItem {
  id: string;
  title: string;
  url: string;
  subtopicId: string;
  publishedDate?: string;
}

export interface CitationItem extends SourceItem {
  /** 1-based index used for inline [n] citations in the report */
  index: number;
}

export type ResearchEvent =
  | { type: "status"; step: ResearchStep; message: string; subtopicId?: string }
  | { type: "plan"; plan: ResearchPlan }
  | { type: "source"; source: SourceItem }
  | { type: "subtopic-complete"; subtopicId: string; summary: string }
  | { type: "report"; report: string; citations: CitationItem[] }
  | { type: "error"; message: string }
  | { type: "done" };

export type EmitFn = (event: ResearchEvent) => void;
