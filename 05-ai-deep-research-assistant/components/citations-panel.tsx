"use client";

import type { CitationItem, ResearchPlan } from "@/lib/research/types";

interface CitationsPanelProps {
  citations: CitationItem[];
  plan: ResearchPlan | null;
}

export function CitationsPanel({ citations, plan }: CitationsPanelProps) {
  if (citations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Once the final report is written, every citation it uses will be listed
        here with the section it supports.
      </p>
    );
  }

  const titleFor = (subtopicId: string) =>
    plan?.subtopics.find((s) => s.id === subtopicId)?.title ?? subtopicId;

  return (
    <ul className="space-y-3">
      {citations.map((c) => (
        <li key={c.id} className="rounded-lg border p-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-muted-foreground shrink-0">
              [{c.index}]
            </span>
            <p className="text-sm font-medium leading-snug">{c.title}</p>
          </div>
          <a
            href={c.url}
            target="_blank"
            rel="noreferrer"
            className="block text-xs text-primary underline underline-offset-2 truncate mt-1 ml-6"
          >
            {c.url}
          </a>
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            Used in: {titleFor(c.subtopicId)}
          </p>
        </li>
      ))}
    </ul>
  );
}
