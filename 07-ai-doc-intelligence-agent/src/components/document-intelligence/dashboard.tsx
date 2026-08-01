"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileSearch } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DocumentUploader } from "@/components/document-intelligence/document-uploader";
import { DocumentList } from "@/components/document-intelligence/document-list";
import { ChatPanel } from "@/components/document-intelligence/chat-panel";
import { WorkbenchTabs } from "@/components/document-intelligence/workbench-tabs";
import { fetchDocuments } from "@/lib/api-client";
import type { DocumentRecord } from "@/lib/types";

export function Dashboard() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch {
      // Silent — the next poll will retry.
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount
    refresh();
  }, [refresh]);

  // Poll while anything is still processing, so status badges and the
  // workbench pick up "ready" documents without a manual refresh.
  useEffect(() => {
    const hasPending = documents.some(
      (d) => d.status === "pending" || d.status === "processing",
    );

    if (hasPending && !pollRef.current) {
      pollRef.current = setInterval(refresh, 2500);
    }
    if (!hasPending && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [documents, refresh]);

  function handleUploaded(newDocs: DocumentRecord[]) {
    setDocuments((prev) => [...newDocs, ...prev]);
  }

  function handleDeleted(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => prev.filter((v) => v !== id));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }

  const hasDocuments = documents.some((d) => d.status === "ready");

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 flex h-screen w-full shrink-0 flex-col border-r bg-card/60 lg:w-[320px]">
        <div className="">
          <div className="mb-4 flex items-center gap-2.5 border-b p-4">
            <FileSearch className="size-6" />
            <h1 className="text-lg font-bold">Document Intelligence Agent</h1>
          </div>
        </div>

        <div className="flex-1 overflow-hidden px-4">
          <div className="h-full gap-3">
            <div className="mb-4">
              <h2 className="text-base font-semibold">Uploaded Documents</h2>
              <p className="text-xs text-muted-foreground">
                Select documents to scope chat, comparisons, and extraction.
              </p>
            </div>
            <DocumentUploader onUploaded={handleUploaded} />
            <div className="min-h-0 flex-1 mt-4">
              <DocumentList
                documents={documents}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onDeleted={handleDeleted}
              />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 ">
        <main className="min-w-0 flex-1">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 p-4 md:p-6">
            <Card className="p-4">
              <WorkbenchTabs documents={documents} />
            </Card>
          </div>
        </main>

        <aside className="sticky top-0 hidden h-screen w-96 shrink-0 border-l bg-card/60 p-4 lg:flex lg:flex-col">
          <div className="mb-1">
            <h2 className="text-base font-bold">AI Chat</h2>
            <p className="text-sm text-muted-foreground">
              {selectedIds.length > 0
                ? `Scoped to ${selectedIds.length} selected document${selectedIds.length > 1 ? "s" : ""}.`
                : "Scoped to all ready documents."}
            </p>
          </div>
          <div className="mt-3 min-h-0 flex-1">
            <ChatPanel
              selectedDocumentIds={selectedIds}
              hasDocuments={hasDocuments}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
