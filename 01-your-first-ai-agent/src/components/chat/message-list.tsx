"use client";

import { useEffect, useRef } from "react";
import type { ChatStatus, UIMessage } from "ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserMessage } from "@/components/message/user-message";
import { AssistantMessage } from "@/components/message/assistant-message";

import { Sparkles } from "lucide-react";
import { ThinkingIndicator } from "../message/thinking-indicator";

function isAgentThinking(messages: UIMessage[], status: ChatStatus) {
  if (status === "submitted") return true;
  if (status !== "streaming") return false;

  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant") return false;

  const lastPart = last.parts[last.parts.length - 1];
  if (!lastPart) return true;

  if (lastPart.type === "dynamic-tool" || lastPart.type.startsWith("tool-")) {
    const state = (lastPart as { state?: string }).state;
    return state === "output-available" || state === "output-error";
  }

  return false;
}

export function MessageList({
  messages,
  status,
}: {
  messages: UIMessage[];
  status: ChatStatus;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center ">
        <div className="flex size-11 items-center justify-center rounded-full ">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-xl font-medium">AI Chat Assistant</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            This is your first agentic AI chat app with basic tools like
            calculator and weather tool.
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Try asking about the weather somewhere, or give it a calculation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-6">
        {messages.map((message) =>
          message.role === "user" ? (
            <UserMessage key={message.id} message={message} />
          ) : (
            <AssistantMessage key={message.id} message={message} />
          ),
        )}
        {isAgentThinking(messages, status) && <ThinkingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
