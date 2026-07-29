import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import type { DocumentRecord, DocumentStatus, DocumentType } from "@/lib/types";

interface DocumentRow {
  id: string;
  filename: string;
  file_type: string;
  mime_type: string | null;
  size_bytes: number;
  page_count: number | null;
  status: string;
  error_message: string | null;
  raw_text: string | null;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

function rowToRecord(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    filename: row.filename,
    fileType: row.file_type as DocumentType,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    pageCount: row.page_count,
    status: row.status as DocumentStatus,
    errorMessage: row.error_message,
    rawText: row.raw_text,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createDocument(input: {
  filename: string;
  fileType: DocumentType;
  mimeType: string | null;
  sizeBytes: number;
}): DocumentRecord {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO documents (id, filename, file_type, mime_type, size_bytes, status)
     VALUES (@id, @filename, @fileType, @mimeType, @sizeBytes, 'pending')`
  ).run({ id, ...input });

  return getDocument(id)!;
}

export function getDocument(id: string): DocumentRecord | null {
  const row = db
    .prepare(`SELECT * FROM documents WHERE id = ?`)
    .get(id) as DocumentRow | undefined;
  return row ? rowToRecord(row) : null;
}

export function listDocuments(): DocumentRecord[] {
  const rows = db
    .prepare(`SELECT * FROM documents ORDER BY created_at DESC`)
    .all() as DocumentRow[];
  return rows.map(rowToRecord);
}

export function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
  errorMessage: string | null = null
): void {
  db.prepare(
    `UPDATE documents SET status = ?, error_message = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(status, errorMessage, id);
}

export function updateDocumentContent(
  id: string,
  input: { rawText: string; pageCount?: number | null; metadata?: Record<string, unknown> }
): void {
  db.prepare(
    `UPDATE documents
     SET raw_text = @rawText,
         page_count = @pageCount,
         metadata = @metadata,
         status = 'ready',
         updated_at = datetime('now')
     WHERE id = @id`
  ).run({
    id,
    rawText: input.rawText,
    pageCount: input.pageCount ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
  });
}

export function deleteDocument(id: string): void {
  db.prepare(`DELETE FROM documents WHERE id = ?`).run(id);
}
