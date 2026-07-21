"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatLayout } from "@/components/chat/chat-layout";
import { MessageList } from "@/components/chat/message-list";
import { PromptBox } from "@/components/chat/prompt-box";
import { AgentSidebar } from "@/components/chat/agent-sidebar";

export default function ChatPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop } = useChat();

  function handleSubmit() {
    const text = input.trim();

    if (!text) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <ChatLayout
      prompt={
        <PromptBox
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onStop={stop}
          status={status}
        />
      }
      sidebar={<AgentSidebar />}
    >
      <div className="mt-10">
        <MessageList status={status} messages={messages} />
      </div>
    </ChatLayout>
  );
}
