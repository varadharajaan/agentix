"use client";

import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type {
  CitationItem,
  ResearchEvent,
  ResearchPlan,
  ResearchStep,
  SourceItem,
} from "@/lib/research/types";

export interface TimelineEntry {
  id: string;
  step: ResearchStep;
  message: string;
  subtopicId?: string;
  done: boolean;
}

export interface SubtopicResult {
  subtopicId: string;
  summary: string;
}

interface ResearchState {
  status: "idle" | "running" | "done" | "error";
  question: string;
  plan: ResearchPlan | null;
  timeline: TimelineEntry[];
  sources: SourceItem[];
  subtopicResults: Record<string, SubtopicResult>;
  report: string | null;
  citations: CitationItem[];
  error: string | null;
}

const initialState: ResearchState = {
  status: "idle",
  question: "",
  plan: null,
  timeline: [],
  sources: [],
  subtopicResults: {},
  report: null,
  citations: [],
  error: null,
};

const STEP_LABELS: Record<ResearchStep, string> = {
  planning: "Understanding question & creating plan",
  searching: "Searching the web",
  reading: "Reading sources",
  comparing: "Comparing information & verifying facts",
  "writing-report": "Writing report",
};

export const RESEARCH_STEP_ORDER: ResearchStep[] = [
  "planning",
  "searching",
  "reading",
  "comparing",
  "writing-report",
];

export { STEP_LABELS };

export function useResearch() {
  const [state, setState] = useState<ResearchState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (question: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ ...initialState, status: "running", question });

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as ResearchEvent;
          applyEvent(event, setState);
        }
      }

      if (buffer.trim()) {
        const event = JSON.parse(buffer) as ResearchEvent;
        applyEvent(event, setState);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((s) => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : "Something went wrong",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(initialState);
  }, []);

  return { state, run, reset };
}

function applyEvent(
  event: ResearchEvent,
  setState: Dispatch<SetStateAction<ResearchState>>
) {
  setState((s) => {
    switch (event.type) {
      case "status": {
        const entry: TimelineEntry = {
          id: `${event.step}-${event.subtopicId ?? "global"}-${s.timeline.length}`,
          step: event.step,
          message: event.message,
          subtopicId: event.subtopicId,
          done: false,
        };
        const timeline = s.timeline.map((t) =>
          t.step === event.step && t.subtopicId === event.subtopicId
            ? { ...t, done: true }
            : t
        );
        return { ...s, timeline: [...timeline, entry] };
      }
      case "plan":
        return { ...s, plan: event.plan };
      case "source":
        return { ...s, sources: [...s.sources, event.source] };
      case "subtopic-complete":
        return {
          ...s,
          subtopicResults: {
            ...s.subtopicResults,
            [event.subtopicId]: {
              subtopicId: event.subtopicId,
              summary: event.summary,
            },
          },
        };
      case "report":
        return { ...s, report: event.report, citations: event.citations };
      case "error":
        return { ...s, status: "error", error: event.message };
      case "done":
        return {
          ...s,
          status: "done",
          timeline: s.timeline.map((t) => ({ ...t, done: true })),
        };
      default:
        return s;
    }
  });
}
