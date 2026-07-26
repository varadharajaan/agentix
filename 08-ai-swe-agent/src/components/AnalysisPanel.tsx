"use client";

import { useState } from "react";
import { Loader2, Sparkles, FileText, ShieldCheck, FlaskConical, Network } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TabBar } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RelevanceBar } from "@/components/RelevanceBar";

type AnalysisTab = "docs" | "review" | "tests" | "architecture";

const TABS: { value: AnalysisTab; label: string; icon: React.ReactNode; endpoint: string }[] = [
  { value: "docs", label: "Documentation", icon: <FileText className="h-3.5 w-3.5" />, endpoint: "/api/docs" },
  { value: "review", label: "Reviews", icon: <ShieldCheck className="h-3.5 w-3.5" />, endpoint: "/api/review" },
  { value: "tests", label: "Tests", icon: <FlaskConical className="h-3.5 w-3.5" />, endpoint: "/api/tests" },
  { value: "architecture", label: "Architecture", icon: <Network className="h-3.5 w-3.5" />, endpoint: "/api/architecture" },
];

interface Result {
  answer: string;
  sources: { path: string; startLine: number; endLine: number; score: number }[];
}

export function AnalysisPanel({
  repoId,
  selectedPath,
  onOpenSource,
}: {
  repoId: string;
  selectedPath: string | null;
  onOpenSource: (path: string, startLine: number, endLine: number) => void;
}) {
  const [tab, setTab] = useState<AnalysisTab>("docs");
  const [results, setResults] = useState<Record<AnalysisTab, Result | null>>({
    docs: null,
    review: null,
    tests: null,
    architecture: null,
  });
  const [loading, setLoading] = useState<AnalysisTab | null>(null);

  const activeConfig = TABS.find((t) => t.value === tab)!;
  const needsPath = tab === "review" || tab === "tests";

  async function run() {
    if (needsPath && !selectedPath) return;
    setLoading(tab);
    try {
      const res = await fetch(activeConfig.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, path: needsPath ? selectedPath : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setResults((prev) => ({ ...prev, [tab]: data }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [tab]: { answer: `⚠️ ${err instanceof Error ? err.message : "Request failed."}`, sources: [] },
      }));
    } finally {
      setLoading(null);
    }
  }

  const result = results[tab];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
        <TabBar
          tabs={TABS.map((t) => ({ value: t.value, label: t.label, icon: t.icon }))}
          value={tab}
          onChange={(v) => setTab(v as AnalysisTab)}
        />
        <Button
          size="sm"
          variant="primary"
          disabled={loading !== null || (needsPath && !selectedPath)}
          onClick={run}
        >
          {loading === tab ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {result ? "Regenerate" : "Generate"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {needsPath && !selectedPath && !result && (
          <p className="text-sm text-[var(--text-faint)]">
            Select a file in the sidebar first — {tab === "review" ? "reviews" : "tests"} are generated
            for one file at a time.
          </p>
        )}

        {needsPath && selectedPath && !result && !loading && (
          <p className="text-sm text-[var(--text-muted)]">
            Ready to {tab === "review" ? "review" : "generate tests for"}{" "}
            <span className="font-mono text-[var(--text)]">{selectedPath}</span>.
          </p>
        )}

        {!needsPath && !result && !loading && (
          <p className="text-sm text-[var(--text-muted)]">
            Click Generate to produce {tab === "docs" ? "documentation" : "an architecture overview"}{" "}
            for the whole repository.
          </p>
        )}

        {loading === tab && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-faint)]">
            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing repository…
          </div>
        )}

        {result && loading !== tab && (
          <div className="max-w-3xl">
            <div className="markdown-body text-[13.5px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.answer}</ReactMarkdown>
            </div>
            {result.sources.length > 0 && (
              <div className="mt-4 space-y-1.5 border-t border-[var(--border-soft)] pt-3">
                <p className="text-[11px] uppercase tracking-wide text-[var(--text-faint)]">
                  Based on
                </p>
                {result.sources.slice(0, 6).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onOpenSource(s.path, s.startLine, s.endLine)}
                    className="flex w-full items-center justify-between gap-3 rounded px-1.5 py-1 text-left hover:bg-[var(--bg-inset)]"
                  >
                    <span className="truncate font-mono text-[11.5px] text-[var(--text-muted)]">
                      {s.path}:{s.startLine}-{s.endLine}
                    </span>
                    <RelevanceBar score={s.score} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
