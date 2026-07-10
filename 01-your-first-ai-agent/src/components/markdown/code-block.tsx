"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// Highlighter is created once and reused across every code block on the page.
let highlighterPromise: ReturnType<typeof import("shiki").createHighlighter> | null = null;

async function getHighlighter() {
  const { createHighlighter } = await import("shiki");
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [
        "typescript",
        "tsx",
        "javascript",
        "jsx",
        "json",
        "bash",
        "python",
        "sql",
        "markdown",
        "yaml",
        "css",
        "html",
      ],
    });
  }
  return highlighterPromise;
}

export function CodeBlock({
  code,
  language,
  inline,
}: {
  code: string;
  language?: string;
  inline?: boolean;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (inline) return;
    let cancelled = false;
    getHighlighter().then((highlighter) => {
      if (cancelled) return;
      const lang = highlighter.getLoadedLanguages().includes(language ?? "")
        ? language!
        : "text";
      setHtml(
        highlighter.codeToHtml(code, {
          lang,
          themes: { light: "github-light", dark: "github-dark" },
        })
      );
    });
    return () => {
      cancelled = true;
    };
  }, [code, language, inline]);

  if (inline) {
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
        {code}
      </code>
    );
  }

  return (
    <div className="group relative my-2 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted px-3 py-1.5">
        <span className="font-mono text-[11px] text-muted-foreground">
          {language ?? "text"}
        </span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {html ? (
        <div
          className={cn("overflow-x-auto text-[13px] [&_pre]:p-3 [&_pre]:!bg-transparent")}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto p-3 font-mono text-[13px]">{code}</pre>
      )}
    </div>
  );
}
