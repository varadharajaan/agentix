import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UiMessage } from "@/hooks/use-memory-chat";
import Markdown from "react-markdown";

export function ChatMessageBubble({ message }: { message: UiMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-secondary text-secondary-foreground rounded-tl-sm",
        )}
      >
        {message.content ? (
          <Markdown>{message.content}</Markdown>
        ) : (
          <div className="inline-flex gap-1 py-0.5">
            <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
            <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
            <span className="size-1.5 rounded-full bg-current animate-bounce" />
          </div>
        )}
      </div>
    </div>
  );
}
