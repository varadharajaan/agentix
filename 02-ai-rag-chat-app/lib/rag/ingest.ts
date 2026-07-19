import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { setDocumentStatus, insertChunks } from "./store";
import { getEmbeddings, invalidateVectorStore } from "./vectorstore";
import type { IngestEvent } from "./types";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

/** Phase 1: extract raw text from an uploaded file's bytes. */
async function extractText(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<string> {
  const isPdf =
    mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    const pdfModule = await import("pdf-parse");

    if (typeof pdfModule.default === "function") {
      const data = await pdfModule.default(buffer);
      return data.text;
    }

    if (typeof pdfModule.PDFParse === "function") {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const data = await parser.getText();
      return data.text;
    }

    throw new Error(
      "The installed pdf-parse package does not expose a supported parser API",
    );
  }

  // .txt, .md, and anything else we treat as plain UTF-8 text.
  return buffer.toString("utf-8");
}

/**
 * Runs the full ingestion pipeline for one uploaded file, emitting an
 * `IngestEvent` at each stage so the UI can show live processing status.
 * The document row (status starts as "processing") must already exist -
 * see app/api/documents/route.ts.
 */
export async function ingestDocument(
  documentId: string,
  file: { buffer: Buffer; mimeType: string; filename: string },
  emit: (event: IngestEvent) => void,
): Promise<void> {
  try {
    emit({
      type: "status",
      step: "extracting",
      message: `Extracting text from ${file.filename}`,
    });
    const text = await extractText(file.buffer, file.mimeType, file.filename);

    if (!text.trim()) {
      throw new Error("No extractable text was found in this file");
    }

    emit({
      type: "status",
      step: "chunking",
      message: "Splitting document into semantic chunks",
    });
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });
    const chunks = await splitter.splitText(text);

    if (chunks.length === 0) {
      throw new Error("Document produced no chunks after splitting");
    }

    emit({
      type: "status",
      step: "embedding",
      message: `Generating embeddings for ${chunks.length} chunk${chunks.length === 1 ? "" : "s"}`,
    });
    const embeddings = getEmbeddings();
    const vectors = await embeddings.embedDocuments(chunks);

    emit({
      type: "status",
      step: "storing",
      message: "Storing chunks in the vector database",
    });
    insertChunks(
      documentId,
      chunks.map((content, i) => ({ content, embedding: vectors[i] })),
    );

    setDocumentStatus(documentId, "ready", { chunkCount: chunks.length });
    invalidateVectorStore();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown ingestion error";
    setDocumentStatus(documentId, "error", { errorMessage: message });
    emit({ type: "error", message });
  }
}
