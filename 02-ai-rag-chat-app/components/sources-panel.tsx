"use client";

import { Quote } from "lucide-react";
import type { RetrievedSource } from "@/lib/rag/types";

interface SourcesPanelProps {
  sources: RetrievedSource[] | null;
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  if (!sources) {
    return (
      <p className="text-sm text-muted-foreground">
        When the assistant answers, the document chunks it used will show up here.
      </p>
    );
  }

  if (sources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No relevant chunks were found in the knowledge base for the last question.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {sources.map((s) => (
        <li key={`${s.documentId}-${s.chunkIndex}`} className="rounded-lg border p-3">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground shrink-0">[{s.index}]</span>
            <p className="text-sm font-medium leading-snug truncate">{s.documentTitle}</p>
          </div>
          <p className="text-xs text-muted-foreground mb-1.5 ml-6">Chunk {s.chunkIndex + 1}</p>
          <div className="flex gap-1.5 ml-6">
            <Quote className="size-3 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
              {s.snippet}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
