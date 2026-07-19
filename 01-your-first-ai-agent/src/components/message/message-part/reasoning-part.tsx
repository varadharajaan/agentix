"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReasoningPart({
  text,
  state,
}: {
  text: string;
  state?: "streaming" | "done";
}) {
  const [open, setOpen] = useState(state === "streaming");

  if (!text) return null;

  return (
    <div className="rounded-lg border border-reasoning/25 bg-reasoning-muted/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-reasoning-foreground/80"
      >
        <Lightbulb className="size-3.5 text-reasoning" />
        <span className="text-foreground/70">
          {state === "streaming" ? "Thinking…" : "Reasoning"}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto size-3.5 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-reasoning/20 px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {text}
        </div>
      )}
    </div>
  );
}
