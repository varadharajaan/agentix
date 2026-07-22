"use client";

import { useMemo } from "react";
import { BookOpenText, Library } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRagChat } from "@/hooks/use-rag-chat";
import {
  DocumentSidebar,
  DocumentCountBadge,
} from "@/components/document-sidebar";
import { SourcesPanel } from "@/components/sources-panel";
import { ChatPanel } from "@/components/chat-panel";

export function RagDashboard() {
  const { state, uploadDocument, deleteDocument, sendMessage } = useRagChat();

  const lastAssistantSources = useMemo(() => {
    const lastAssistant = [...state.messages]
      .reverse()
      .find((m) => m.role === "assistant");
    return lastAssistant?.sources ?? null;
  }, [state.messages]);

  const hasReadyDocuments = state.documents.some((d) => d.status === "ready");

  return (
    <div className="h-dvh flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b p-5 shrink-0">
        <BookOpenText className="size-8 text-primary" />
        <h1 className="text-lg font-bold">RAG Chat Application</h1>
        <DocumentCountBadge documents={state.documents} />
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-80 border-r flex flex-col min-h-0 shrink-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4">
              <DocumentSidebar
                documents={state.documents}
                documentsLoaded={state.documentsLoaded}
                uploadingFilename={state.uploadingFilename}
                uploadStatusMessage={state.uploadStatusMessage}
                onUpload={uploadDocument}
                onDelete={deleteDocument}
              />
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 min-h-0 flex flex-col">
          <ChatPanel
            messages={state.messages}
            isReplying={state.isReplying}
            chatStatusMessage={state.chatStatusMessage}
            error={state.error}
            hasReadyDocuments={hasReadyDocuments}
            onSend={sendMessage}
          />
        </main>

        <aside className="w-80 border-l flex flex-col min-h-0 shrink-0">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Library className="size-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Retrieved Sources
                </p>
              </div>
              <SourcesPanel sources={lastAssistantSources} />
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
