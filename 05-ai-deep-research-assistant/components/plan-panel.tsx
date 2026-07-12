"use client";

import { CheckCircle2, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ResearchPlan } from "@/lib/research/types";
import type { SubtopicResult } from "@/hooks/use-research";

interface PlanPanelProps {
  plan: ResearchPlan | null;
  subtopicResults: Record<string, SubtopicResult>;
  activeSubtopicId: string | null;
}

export function PlanPanel({ plan, subtopicResults, activeSubtopicId }: PlanPanelProps) {
  if (!plan) {
    return (
      <p className="text-sm text-muted-foreground">
        The research plan and subtasks will appear here once the agent starts working.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
          Objective
        </p>
        <p className="text-sm">{plan.objective}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Subtasks
        </p>
        {plan.subtopics.map((subtopic) => {
          const done = Boolean(subtopicResults[subtopic.id]);
          const active = activeSubtopicId === subtopic.id && !done;

          return (
            <div key={subtopic.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {done ? (
                    <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : active ? (
                    <Loader2 className="size-4 mt-0.5 shrink-0 animate-spin text-primary" />
                  ) : (
                    <Search className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  )}
                  <p className="text-sm font-medium leading-snug">{subtopic.title}</p>
                </div>
                <Badge variant={done ? "success" : "outline"} className="shrink-0">
                  {done ? "Done" : active ? "Researching" : "Queued"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 pl-6">
                {subtopic.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
