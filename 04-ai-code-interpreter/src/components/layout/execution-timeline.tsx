"use client";

import { cn } from "@/lib/utils";
import { TimelineStep } from "@/types/types";

function dotClasses(status: TimelineStep["status"]) {
  switch (status) {
    case "done":
      return "bg-green-500 border-green-600";
    case "active":
      return "bg-sky-500 border-sky-600 animate-pulse-dot";
    case "error":
      return "bg-red-500 border-red-600";
    case "skipped":
      return "bg-gray-300 border-gray-300";
    default:
      return "bg-gray-300 border-gray-300";
  }
}

function labelClasses(status: TimelineStep["status"]) {
  switch (status) {
    case "done":
      return "text-green-900";
    case "active":
      return "text-sky-900";
    case "error":
      return "text-red-900";
    case "skipped":
      return "text-muted-foreground line-through";
    default:
      return "text-muted-foreground";
  }
}

function elapsed(step: TimelineStep) {
  if (!step.startedAt) return null;
  const end = step.endedAt ?? Date.now();
  const ms = end - step.startedAt;
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export function ExecutionTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="rounded-lg border px-4 py-3">
      <div className="mb-3 font-bold text-xs uppercase tracking-widest">
        Agent workflow
      </div>
      <ol className="relative">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const nextDone =
            !isLast &&
            (steps[i].status === "done" || steps[i].status === "skipped");
          return (
            <li key={step.id} className="relative flex gap-3 pb-3 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[5px] top-3 h-full w-px origin-top bg-gray-500",
                    nextDone && "bg-green-500",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2",
                  dotClasses(step.status),
                )}
              />
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                <span className={cn("text-[13px]", labelClasses(step.status))}>
                  {step.label}
                  {step.detail && (
                    <span className="ml-3 text-xs">{step.detail}</span>
                  )}
                </span>
                {elapsed(step) && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {elapsed(step)}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
