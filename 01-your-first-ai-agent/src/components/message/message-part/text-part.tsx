import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";

export function TextPart({
  text,
  state,
}: {
  text: string;
  state?: "streaming" | "done";
}) {
  return (
    <div className="leading-relaxed">
      <MarkdownRenderer content={text} />
      {state === "streaming" && (
        <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-agent-pulse bg-foreground" />
      )}
    </div>
  );
}
