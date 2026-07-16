"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";

type InputPromptProps = {
  question: string;
  loading: boolean;
  error: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
};

export default function InputPrompt({
  question,
  loading,
  error,
  onQuestionChange,
  onSubmit,
}: InputPromptProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 left-0 z-20 border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60 lg:left-80 lg:right-96">
      <div className="space-y-3">
        <Textarea
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Ask a question about this database…"
          className="min-h-10 resize-none border-0 bg-transparent p-2 text-base shadow-none focus-visible:ring-0"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-xs text-slate-400">
            Enter to send · Shift + Enter for a new line
          </span>
          <Button
            size="icon"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-lg bg-slate-950 hover:bg-slate-800"
          >
            <ArrowUp className="size-4" />
            <span className="sr-only">
              {loading ? "Generating" : "Ask database"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
