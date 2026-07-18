"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatEvent, IngestEvent, RagDocument, RetrievedSource } from "@/lib/rag/types";

export interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: RetrievedSource[];
}

interface RagChatState {
  documents: RagDocument[];
  documentsLoaded: boolean;
  uploadingFilename: string | null;
  uploadStatusMessage: string | null;
  messages: UiMessage[];
  isReplying: boolean;
  chatStatusMessage: string | null;
  error: string | null;
}

const initialState: RagChatState = {
  documents: [],
  documentsLoaded: false,
  uploadingFilename: null,
  uploadStatusMessage: null,
  messages: [],
  isReplying: false,
  chatStatusMessage: null,
  error: null,
};

function uid() {
  return Math.random().toString(36).slice(2);
}

async function readNdjson<T>(res: Response, onEvent: (event: T) => void) {
  if (!res.body) throw new Error("Response had no body");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const handleLine = (line: string) => {
    if (!line.trim()) return;
    onEvent(JSON.parse(line) as T);
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
}

export function useRagChat() {
  const [state, setState] = useState<RagChatState>(initialState);
  const messagesRef = useRef<UiMessage[]>([]);

  useEffect(() => {
    messagesRef.current = state.messages;
  }, [state.messages]);

  const refreshDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const data = (await res.json()) as { documents: RagDocument[] };
      setState((s) => ({ ...s, documents: data.documents ?? [], documentsLoaded: true }));
    } catch {
      setState((s) => ({ ...s, documentsLoaded: true }));
    }
  }, []);

  useEffect(() => {
    void refreshDocuments();
  }, [refreshDocuments]);

  const uploadDocument = useCallback(
    async (file: File) => {
      setState((s) => ({
        ...s,
        uploadingFilename: file.name,
        uploadStatusMessage: "Uploading…",
        error: null,
      }));

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/documents", { method: "POST", body: formData });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(body.error ?? `Upload failed (${res.status})`);
        }

        await readNdjson<IngestEvent>(res, (event) => {
          if (event.type === "status") {
            setState((s) => ({ ...s, uploadStatusMessage: event.message }));
          } else if (event.type === "document") {
            setState((s) => {
              const exists = s.documents.some((d) => d.id === event.document.id);
              const documents = exists
                ? s.documents.map((d) => (d.id === event.document.id ? event.document : d))
                : [event.document, ...s.documents];
              return { ...s, documents };
            });
          } else if (event.type === "error") {
            setState((s) => ({ ...s, error: event.message }));
          }
        });
      } catch (err) {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : "Upload failed",
        }));
      } finally {
        setState((s) => ({ ...s, uploadingFilename: null, uploadStatusMessage: null }));
      }
    },
    []
  );

  const deleteDocument = useCallback(async (id: string) => {
    setState((s) => ({ ...s, documents: s.documents.filter((d) => d.id !== id) }));
    try {
      await fetch(`/api/documents?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {
      // Best-effort UI update; refreshDocuments() would resync on next load.
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const question = text.trim();
    if (!question) return;

    const userMessage: UiMessage = { id: uid(), role: "user", content: question };
    const assistantId = uid();
    const historyForRequest = messagesRef.current;

    setState((s) => ({
      ...s,
      error: null,
      isReplying: true,
      chatStatusMessage: "Searching the knowledge base…",
      messages: [
        ...s.messages,
        userMessage,
        { id: assistantId, role: "assistant", content: "" },
      ],
    }));

    let assistantText = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          history: historyForRequest.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      await readNdjson<ChatEvent>(res, (event) => {
        if (event.type === "status") {
          setState((s) => ({ ...s, chatStatusMessage: event.message }));
        } else if (event.type === "sources") {
          setState((s) => ({
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantId ? { ...m, sources: event.sources } : m
            ),
          }));
        } else if (event.type === "token") {
          assistantText += event.text;
          const snapshot = assistantText;
          setState((s) => ({
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantId ? { ...m, content: snapshot } : m
            ),
          }));
        } else if (event.type === "done") {
          if (event.answer && event.answer !== assistantText) {
            const finalText = event.answer;
            setState((s) => ({
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantId ? { ...m, content: finalText } : m
              ),
            }));
          }
          setState((s) => ({ ...s, chatStatusMessage: null }));
        } else if (event.type === "error") {
          setState((s) => ({ ...s, error: event.message, chatStatusMessage: null }));
        }
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Something went wrong",
        chatStatusMessage: null,
      }));
    } finally {
      setState((s) => ({ ...s, isReplying: false }));
    }
  }, []);

  return { state, uploadDocument, deleteDocument, sendMessage };
}
