import mammoth from "mammoth";
import Papa from "papaparse";

import type { DocumentType } from "@/lib/types";
import { cleanText } from "@/lib/processing/clean";
import type { TextChunk } from "@/lib/processing/chunk";
import { chunkPages, chunkText } from "@/lib/processing/chunk";

export interface ExtractionResult {
  rawText: string;
  pageCount: number | null;
  chunks: TextChunk[];
  metadata: Record<string, unknown>;
}

export function detectFileType(filename: string, mimeType: string | null): DocumentType {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "pdf";
    case "docx":
      return "docx";
    case "txt":
      return "txt";
    case "md":
    case "markdown":
      return "md";
    case "csv":
      return "csv";
    case "json":
      return "json";
    case "png":
      return "png";
    case "jpg":
    case "jpeg":
      return "jpeg";
    default:
      if (mimeType?.includes("pdf")) return "pdf";
      if (mimeType?.includes("csv")) return "csv";
      if (mimeType?.includes("json")) return "json";
      return "txt";
  }
}

export async function extractDocument(
  buffer: Buffer,
  fileType: DocumentType
): Promise<ExtractionResult> {
  switch (fileType) {
    case "pdf":
      return extractPdf(buffer);
    case "docx":
      return extractDocx(buffer);
    case "csv":
      return extractCsv(buffer);
    case "json":
      return extractJson(buffer);
    case "txt":
    case "md":
      return extractPlainText(buffer);
    case "png":
    case "jpeg":
      // Bonus path: wire in an OCR step (e.g. Tesseract.js or a
      // vision-capable model) before chunking. Left as a stub so the
      // pipeline still records the upload without failing.
      return {
        rawText: "",
        pageCount: null,
        chunks: [],
        metadata: { note: "OCR not yet implemented for image uploads." },
      };
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
  // Lazy import so pdf-parse (and its pdfjs dependency) only loads inside a
  // request handler, not at module init.
  const { PDFParse } = await import("pdf-parse");

  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();

    const rawText = cleanText(result.text);
    const pages = result.pages
      .map((p) => ({ pageNumber: p.num, text: cleanText(p.text) }))
      .filter((p) => p.text.length > 0);

    const chunks =
      pages.length > 0 ? chunkPages(pages) : chunkText(rawText).map((c) => ({ content: c }));

    return {
      rawText,
      pageCount: result.total,
      chunks,
      metadata: {},
    };
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
  const result = await mammoth.extractRawText({ buffer });
  const rawText = cleanText(result.value);
  const chunks = chunkText(rawText).map((content) => ({ content }));

  return {
    rawText,
    pageCount: null,
    chunks,
    metadata: { warnings: result.messages.map((m) => m.message) },
  };
}

async function extractPlainText(buffer: Buffer): Promise<ExtractionResult> {
  const rawText = cleanText(buffer.toString("utf-8"));
  const chunks = chunkText(rawText).map((content) => ({ content }));

  return { rawText, pageCount: null, chunks, metadata: {} };
}

async function extractCsv(buffer: Buffer): Promise<ExtractionResult> {
  const text = buffer.toString("utf-8");
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data;
  const fields = parsed.meta.fields ?? [];

  // Render each row as a small readable record so it embeds and retrieves
  // well as natural-language-ish text, rather than as raw CSV.
  const rowTexts = rows.map((row, i) => {
    const fieldsText = fields.map((f) => `${f}: ${row[f] ?? ""}`).join(", ");
    return `Row ${i + 1} — ${fieldsText}`;
  });

  const rawText = cleanText(rowTexts.join("\n"));

  // Group ~20 rows per chunk so each chunk carries enough rows to be
  // useful for aggregate questions, without ballooning past the model's
  // effective context per retrieved chunk.
  const chunks: TextChunk[] = [];
  const rowsPerChunk = 20;
  for (let i = 0; i < rowTexts.length; i += rowsPerChunk) {
    chunks.push({ content: rowTexts.slice(i, i + rowsPerChunk).join("\n") });
  }

  return {
    rawText,
    pageCount: null,
    chunks,
    metadata: { columns: fields, rowCount: rows.length },
  };
}

async function extractJson(buffer: Buffer): Promise<ExtractionResult> {
  const text = buffer.toString("utf-8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Fall back to treating malformed JSON as plain text.
    return extractPlainText(buffer);
  }

  const rawText = cleanText(JSON.stringify(parsed, null, 2));
  const chunks = chunkText(rawText, { chunkSize: 1500 }).map((content) => ({ content }));

  return {
    rawText,
    pageCount: null,
    chunks,
    metadata: { isArray: Array.isArray(parsed) },
  };
}
