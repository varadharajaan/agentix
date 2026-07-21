"use client";

import { useRef, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatStatus } from "ai";

const examplePrompts = [
  "What is the weather forecast for Tokyo tomorrow?",
  "Calculate 18% of 240 and explain it.",
];

export function PromptBox({
  value,
  onChange,
  onSubmit,
  onStop,
  status,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  status: ChatStatus;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBusy = status === "submitted" || status === "streaming";

  function handleFillExample(prompt: string) {
    onChange(prompt);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isBusy) onSubmit();
    }
  }

  return (
    <div className="w-full px-4 py-4">
      <div className="grid gap-2 sm:grid-cols-3 mb-3">
        {examplePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleFillExample(prompt)}
            className="rounded-md border border-border bg-card/80 px-3 py-2 text-left text-xs text-foreground transition "
          >
            {prompt}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-sm">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything — try “what's the weather in Tokyo” or “what's 18% of 240”"
          rows={1}
          className="max-h-32 min-h-9 flex-1 px-2 py-1.5 bg-transparent border-0"
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
          }}
        />
        {isBusy ? (
          <Button
            size="icon"
            variant={"secondary"}
            onClick={onStop}
            aria-label="Stop"
          >
            <Square className="size-3.5" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="default"
            onClick={onSubmit}
            disabled={!value.trim()}
            aria-label="Send"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm"
          >
            <ArrowUp className="size-6" />
          </Button>
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        AI can make mistakes. This is a course project, not a production app.
      </p>
    </div>
  );
}
