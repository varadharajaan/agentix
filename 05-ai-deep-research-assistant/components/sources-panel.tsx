"use client";

import { Globe } from "lucide-react";
import type { ResearchPlan, SourceItem } from "@/lib/research/types";

interface SourcesPanelProps {
  sources: SourceItem[];
  plan: ResearchPlan | null;
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SourcesPanel({ sources, plan }: SourcesPanelProps) {
  if (sources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sources the agent reads while researching will be listed here as it finds them.
      </p>
    );
  }

  const titleFor = (subtopicId: string) =>
    plan?.subtopics.find((s) => s.id === subtopicId)?.title ?? subtopicId;

  const grouped = new Map<string, SourceItem[]>();
  for (const source of sources) {
    const list = grouped.get(source.subtopicId) ?? [];
    list.push(source);
    grouped.set(source.subtopicId, list);
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([subtopicId, items]) => (
        <div key={subtopicId}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
            {titleFor(subtopicId)}
          </p>
          <ul className="space-y-1.5">
            {items.map((source) => (
              <li key={source.id}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 rounded-md p-1.5 -mx-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <Globe className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate">{source.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {hostname(source.url)}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
