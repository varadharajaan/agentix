"use client";

import { useState, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "../ui/button";

const SUGGESTIONS = [
  "Show summary statistics",
  "Find missing values",
  "Plot monthly revenue",
  "Generate a PDF report",
];

export function PromptBar({
  onSubmit,
  disabled,
  showSuggestions,
}: {
  onSubmit: (prompt: string) => void;
  disabled: boolean;
  showSuggestions: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t bg-gray-50 px-6 py-4 backdrop-blur">
      {showSuggestions && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSubmit(s)}
              disabled={disabled}
              className="border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-gray-300 bg-gray-100 hover:text-gray-600  disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 border border-base-border bg-base-panel2 px-3 py-2 focus-within:border-accent-amber/50">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask the interpreter to analyze, visualize, or transform your data…"
          rows={1}
          className="max-h-40 flex-1 resize-none bg-transparent text-sm focus:outline-none"
        />
        <Button
          size="sm"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send"
        >
          <ArrowUp size={14} />
        </Button>
      </div>
      <p className="mt-2 px-1 text-xs ">
        Code runs in a sandboxed Python process · Enter to send · Shift+Enter
        for a new line
      </p>
    </div>
  );
}
