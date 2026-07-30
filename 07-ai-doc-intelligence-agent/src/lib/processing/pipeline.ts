import { insertChunks, insertEmbedding } from "@/lib/db/chunks";
import { updateDocumentContent, updateDocumentStatus } from "@/lib/db/documents";
import { embedTexts } from "@/lib/ai/embeddings";
import { extractDocument } from "@/lib/processing/extract";
import type { DocumentType } from "@/lib/types";

/**
 * Runs the full pipeline for one uploaded document:
 * extract -> clean (done inside extractors) -> chunk -> embed -> store.
 * Mirrors the "Document Processing Pipeline" in the project spec.
 */
export async function processDocument(
  documentId: string,
  buffer: Buffer,
  fileType: DocumentType
): Promise<void> {
  updateDocumentStatus(documentId, "processing");

  try {
    const { rawText, pageCount, chunks, metadata } = await extractDocument(buffer, fileType);

    if (chunks.length === 0) {
      updateDocumentContent(documentId, { rawText, pageCount, metadata });
      return;
    }

    const chunkRecords = insertChunks(
      documentId,
      chunks.map((c) => ({ content: c.content, pageNumber: c.pageNumber ?? null }))
    );

    const vectors = await embedTexts(chunkRecords.map((c) => c.content));
    vectors.forEach((vector, i) => insertEmbedding(chunkRecords[i].id, vector));

    updateDocumentContent(documentId, { rawText, pageCount, metadata });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown processing error";
    updateDocumentStatus(documentId, "error", message);
    throw err;
  }
}
