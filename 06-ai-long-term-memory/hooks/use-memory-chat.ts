"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, Memory, MemoryEvent } from "@/lib/memory/types";

export interface UiMessage extends ChatMessage {
  id: string;
}

export interface MemoryActivity {
  id: string;
  op: "create" | "update" | "forget";
  memory: Memory;
}

interface MemoryChatState {
  messages: UiMessage[];
  memories: Memory[];
  isReplying: boolean;
  isRemembering: boolean;
  recentActivity: MemoryActivity[];
  error: string | null;
  memoriesLoaded: boolean;
}

const initialState: MemoryChatState = {
  messages: [],
  memories: [],
  isReplying: false,
  isRemembering: false,
  recentActivity: [],
  error: null,
  memoriesLoaded: false,
};

function uid() {
  return Math.random().toString(36).slice(2);
}

export function useMemoryChat() {
  const [state, setState] = useState<MemoryChatState>(initialState);
  const messagesRef = useRef<UiMessage[]>([]);

  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  // Load whatever the assistant already remembers on first mount.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/memories")
      .then((res) => res.json())
      .then((data: { memories: Memory[] }) => {
        if (cancelled) return;
        setState((s) => ({ ...s, memories: data.memories ?? [], memoriesLoaded: true }));
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, memoriesLoaded: true }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const runExtraction = useCallback(async (userText: string, assistantText: string) => {
    setState((s) => ({ ...s, isRemembering: true }));

    try {
      const res = await fetch("/api/memories/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userText, assistant: assistantText }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Memory extraction failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handleLine = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line) as MemoryEvent;

        setState((s) => {
          if (event.type === "operation") {
            const activity: MemoryActivity = {
              id: uid(),
              op: event.op,
              memory: event.memory,
            };
            return { ...s, recentActivity: [...s.recentActivity, activity] };
          }
          if (event.type === "done") {
            return { ...s, memories: event.memories, isRemembering: false };
          }
          if (event.type === "error") {
            return { ...s, isRemembering: false, error: event.message };
          }
          return s;
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) handleLine(line);
      }
      if (buffer.trim()) handleLine(buffer);
    } catch (err) {
      setState((s) => ({
        ...s,
        isRemembering: false,
        error: err instanceof Error ? err.message : "Memory extraction failed",
      }));
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question) return;

      const userMessage: UiMessage = { id: uid(), role: "user", content: question };
      const assistantId = uid();
      const historyForRequest = messagesRef.current;

      setState((s) => ({
        ...s,
        error: null,
        isReplying: true,
        messages: [...s.messages, userMessage, { id: assistantId, role: "assistant", content: "" }],
      }));

      let assistantText = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: question,
            history: historyForRequest.map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!res.ok || !res.body) {
          const body = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(body.error ?? `Request failed (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          const snapshot = assistantText;
          setState((s) => ({
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantId ? { ...m, content: snapshot } : m
            ),
          }));
        }
      } catch (err) {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : "Something went wrong",
        }));
      } finally {
        setState((s) => ({ ...s, isReplying: false }));
      }

      if (assistantText.trim()) {
        void runExtraction(question, assistantText);
      }
    },
    [runExtraction]
  );

  const forgetMemory = useCallback(async (id: string) => {
    setState((s) => ({ ...s, memories: s.memories.filter((m) => m.id !== id) }));
    try {
      await fetch(`/api/memories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {
      // Best-effort UI update; a page refresh will resync from the server.
    }
  }, []);

  return { state, sendMessage, forgetMemory };
}
