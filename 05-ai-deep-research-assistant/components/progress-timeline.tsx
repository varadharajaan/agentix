"use client";

import { CheckCircle2, CircleDashed, Loader2 } from "lucide-react";
import { RESEARCH_STEP_ORDER, STEP_LABELS, type TimelineEntry } from "@/hooks/use-research";
import type { ResearchStep } from "@/lib/research/types";
import { cn } from "@/lib/utils";

interface ProgressTimelineProps {
  timeline: TimelineEntry[];
  status: "idle" | "running" | "done" | "error";
}

/**
 * Renders the high-level "UI Timeline" from the spec: understanding the
 * question -> planning -> searching -> reading -> comparing -> writing.
 * Detailed per-subtopic messages are shown as sub-lines under each stage.
 */
export function ProgressTimeline({ timeline, status }: ProgressTimelineProps) {
  if (timeline.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ask a research question to see the agent&apos;s live progress here.
      </p>
    );
  }

  const byStep = new Map<ResearchStep, TimelineEntry[]>();
  for (const entry of timeline) {
    const list = byStep.get(entry.step) ?? [];
    list.push(entry);
    byStep.set(entry.step, list);
  }

  const stepsReached = RESEARCH_STEP_ORDER.filter((step) => byStep.has(step));
  const lastReachedIndex = RESEARCH_STEP_ORDER.indexOf(
    stepsReached[stepsReached.length - 1]
  );

  return (
    <ol className="space-y-3">
      {RESEARCH_STEP_ORDER.map((step, i) => {
        const entries = byStep.get(step);
        if (!entries) return null;

        const isCurrentStep = i === lastReachedIndex && status === "running";
        const stepDone = entries.every((e) => e.done) && !isCurrentStep;

        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center pt-0.5">
              {stepDone ? (
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              ) : isCurrentStep ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <CircleDashed className="size-4 text-muted-foreground" />
              )}
              {i < RESEARCH_STEP_ORDER.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1 min-h-3" />
              )}
            </div>
            <div className="flex-1 pb-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  stepDone ? "text-foreground" : "text-foreground"
                )}
              >
                {STEP_LABELS[step]}
              </p>
              <ul className="mt-1 space-y-0.5">
                {entries.map((e) => (
                  <li key={e.id} className="text-xs text-muted-foreground">
                    {e.message}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
