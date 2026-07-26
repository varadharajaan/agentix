"use client";

import Editor from "@monaco-editor/react";
import { FileCode2, Loader2 } from "lucide-react";

const MONACO_LANGUAGE: Record<string, string> = {
  typescript: "typescript",
  javascript: "javascript",
  python: "python",
  java: "java",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  csharp: "csharp",
  cpp: "cpp",
  c: "c",
  swift: "swift",
  kotlin: "kotlin",
  scala: "scala",
  markdown: "markdown",
  json: "json",
  yaml: "yaml",
  toml: "ini",
  html: "html",
  css: "css",
  scss: "scss",
  sql: "sql",
  shell: "shell",
  graphql: "graphql",
  vue: "html",
};

export function CodeViewer({
  path,
  language,
  content,
  loading,
  highlightLines,
}: {
  path: string | null;
  language: string;
  content: string;
  loading: boolean;
  highlightLines?: [number, number] | null;
}) {
  if (!path) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--text-faint)]">
        <FileCode2 className="h-6 w-6" />
        <p className="text-sm">Select a file to view its source</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2">
        <FileCode2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        <span className="font-mono text-xs text-[var(--text-muted)]">{path}</span>
      </div>
      <div className="relative flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-faint)]" />
          </div>
        ) : (
          <Editor
            height="100%"
            language={MONACO_LANGUAGE[language] ?? "plaintext"}
            value={content}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "JetBrains Mono, monospace",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              renderLineHighlight: highlightLines ? "all" : "none",
            }}
            onMount={(editor, monaco) => {
              if (highlightLines) {
                const [start, end] = highlightLines;
                editor.revealLineInCenter(start);
                editor.createDecorationsCollection([
                  {
                    range: new monaco.Range(start, 1, end, 1),
                    options: {
                      isWholeLine: true,
                      className: "monaco-highlight-line",
                      overviewRuler: { color: "#e8a33d", position: 1 },
                    },
                  },
                ]);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
