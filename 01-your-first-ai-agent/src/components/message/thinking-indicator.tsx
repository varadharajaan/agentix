import { Sparkles } from "lucide-react";

export function ThinkingIndicator({ label = "Thinking" }: { label?: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-agent/15 text-agent">
        <Sparkles className="size-3.5 animate-agent-pulse" />
      </div>
      <div className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
        <span>{label}</span>
        <span className="flex items-end gap-0.5 pb-0.5">
          <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <span className="size-1 animate-bounce rounded-full bg-muted-foreground" />
        </span>
      </div>
    </div>
  );
}
