import type { UIMessage } from "ai";
import { Sparkles } from "lucide-react";
import { TextPart } from "./message-part/text-part";
import { ReasoningPart } from "./message-part/reasoning-part";
import { ToolCallPart } from "./message-part/tool-call-part";

export function AssistantMessage({ message }: { message: UIMessage }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-200">
        <Sparkles className="size-3.5" />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {message.parts.map((part, i) => {
          switch (part.type) {
            case "text":
              return <TextPart key={i} text={part.text} state={part.state} />;

            case "reasoning":
              return (
                <ReasoningPart key={i} text={part.text} state={part.state} />
              );

            case "dynamic-tool":
              return (
                <ToolCallPart
                  key={i}
                  toolName={part.toolName}
                  state={part.state}
                  input={"input" in part ? part.input : undefined}
                  output={"output" in part ? part.output : undefined}
                  errorText={"errorText" in part ? part.errorText : undefined}
                />
              );

            default:
              if (part.type.startsWith("tool-")) {
                const p = part as unknown as {
                  type: string;
                  state: string;
                  input?: unknown;
                  output?: unknown;
                  errorText?: string;
                };
                return (
                  <ToolCallPart
                    key={i}
                    toolName={p.type.replace("tool-", "")}
                    state={p.state}
                    input={p.input}
                    output={p.output}
                    errorText={p.errorText}
                  />
                );
              }
              return null;
          }
        })}
      </div>
    </div>
  );
}
