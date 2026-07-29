import type { DocumentRecord, MessageRecord } from "@/lib/types";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.formErrors?.[0] ?? body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentRecord[]> {
  const res = await fetch("/api/documents");
  const data = await handle<{ documents: DocumentRecord[] }>(res);
  return data.documents;
}

export async function uploadDocuments(files: File[]): Promise<DocumentRecord[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetch("/api/documents", { method: "POST", body: formData });
  const data = await handle<{ documents: DocumentRecord[] }>(res);
  return data.documents;
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
  await handle(res);
}

export async function sendChatMessage(input: {
  message: string;
  conversationId?: string;
  documentIds?: string[];
}): Promise<{ conversationId: string; message: MessageRecord; intent: string }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res);
}

export async function compareDocuments(input: {
  documentIds: string[];
  focus?: string;
}): Promise<{ documents: { id: string; filename: string }[]; comparison: string }> {
  const res = await fetch("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res);
}

export async function extractFromDocument(input: {
  documentId: string;
  instructions: string;
}): Promise<{
  filename: string;
  extraction: { summary: string; items: { label: string; value: string; sourcePage: number | null }[] };
}> {
  const res = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res);
}

export async function generateReport(input: {
  documentIds: string[];
  reportType: "executive_summary" | "detailed_report";
}): Promise<{ documents: { id: string; filename: string }[]; report: string }> {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle(res);
}
