"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { RelevanceBar } from "@/components/RelevanceBar";
import { ChunkWithScore } from "@/lib/types";

export function SearchPanel({
  repoId,
  onSelect,
}: {
  repoId: string;
  onSelect: (path: string, startLine: number, endLine: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ChunkWithScore[]>([]);
  const [loading, setLoading] = useState(false);

  async function runSearch(q: string) {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, query: q, topK: 10 }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative p-2.5">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-faint)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
          placeholder="Semantic search…"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-inset)] py-1.5 pl-8 pr-2 text-xs outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {loading && (
          <div className="flex items-center gap-2 px-2 py-3 text-xs text-[var(--text-faint)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
          </div>
        )}

        {!loading &&
          results.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.path, r.startLine, r.endLine)}
              className="mb-1 flex w-full flex-col gap-1 rounded-md border border-transparent px-2 py-1.5 text-left hover:border-[var(--border)] hover:bg-[var(--bg-inset)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[11.5px] text-[var(--text)]">
                  {r.path}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] text-[var(--text-faint)]">
                  lines {r.startLine}-{r.endLine}
                  {r.symbol ? ` · ${r.symbol}` : ""}
                </span>
                <RelevanceBar score={r.score} />
              </div>
            </button>
          ))}

        {!loading && query && results.length === 0 && (
          <p className="px-2 py-3 text-xs text-[var(--text-faint)]">No matches yet.</p>
        )}
      </div>
    </div>
  );
}
