"use client";

import { useState } from "react";
import {
  ChevronDown,
  Cloud,
  Calculator,
  Wrench,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | (string & {});

const TOOL_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  get_weather: Cloud,
  calculator: Calculator,
};

const TOOL_LABELS: Record<string, string> = {
  get_weather: "Weather lookup",
  calculator: "Calculator",
};

export function ToolCallPart({
  toolName,
  state,
  input,
  output,
  errorText,
}: {
  toolName: string;
  state: ToolState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}) {
  const [open, setOpen] = useState(false);
  const Icon = TOOL_ICONS[toolName] ?? Wrench;
  const label = TOOL_LABELS[toolName] ?? toolName;

  const isRunning = state === "input-streaming" || state === "input-available";
  const isError = state === "output-error";
  const isDone = state === "output-available";

  return (
    <div className="w-full max-w-md rounded-lg border border-agent/25 bg-agent-muted/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <span className="flex size-6 items-center justify-center rounded-md bg-agent/15 text-agent">
          <Icon className="size-3.5" />
        </span>
        <span className="text-xs font-medium text-foreground/85">{label}</span>

        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {isRunning && (
            <>
              <Loader2 className="size-3 animate-spin" />
              Running
            </>
          )}
          {isDone && (
            <>
              <Check className="size-3 text-agent" />
              Done
            </>
          )}
          {isError && (
            <>
              <X className="size-3 text-destructive" />
              Failed
            </>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="space-y-2 border-t border-agent/20 px-3 py-2 text-[11px]">
          {input !== undefined && (
            <div>
              <div className="mb-0.5 font-medium text-muted-foreground">
                Input
              </div>
              <pre className="overflow-x-auto rounded-md bg-background/60 p-2 font-mono">
                {JSON.stringify(input, null, 2)}
              </pre>
            </div>
          )}
          {isDone && output !== undefined && (
            <div>
              <div className="mb-0.5 font-medium text-muted-foreground">
                Output
              </div>
              <pre className="overflow-x-auto rounded-md bg-background/60 p-2 font-mono">
                {JSON.stringify(output, null, 2)}
              </pre>
            </div>
          )}
          {isError && (
            <div className="rounded-md bg-destructive/10 p-2 text-destructive">
              {errorText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
