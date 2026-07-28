import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

import { getDocument } from "@/lib/db/documents";
import { getChunksForDocument } from "@/lib/db/chunks";
import { CHAT_MODEL, openai } from "@/lib/ai/openai";

export const runtime = "nodejs";

const requestSchema = z.object({
  documentId: z.string(),
  // Plain-language description of what to pull out, e.g. "every invoice
  // number, vendor, date, and amount".
  instructions: z.string().min(1),
});

// A general-purpose extraction shape: a list of field/value records plus
// an overall summary. Swap in a narrower zod schema (invoice fields,
// contact fields, etc.) for a fixed, form-like extraction if the field
// set is known ahead of time.
const ExtractionResult = z.object({
  summary: z.string().describe("One-sentence description of what was extracted."),
  items: z
    .array(
      z.object({
        label: z.string().describe("What this extracted item represents."),
        value: z.string().describe("The extracted value, verbatim from the source."),
        sourcePage: z.number().nullable().describe("Page number if known, else null."),
      })
    )
    .describe("Every extracted instance, one per array entry."),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { documentId, instructions } = parsed.data;

  const document = getDocument(documentId);
  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  if (document.status !== "ready") {
    return NextResponse.json(
      { error: "Document is still processing." },
      { status: 409 }
    );
  }

  const chunks = getChunksForDocument(documentId);
  const fullText = chunks.map((c) => c.content).join("\n\n");

  const response = await openai.chat.completions.parse({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You extract structured data from documents for a document-intelligence tool. Extract only what's explicitly present in the text — never invent values. If a requested field doesn't appear, omit it rather than guessing.",
      },
      {
        role: "user",
        content: `Document: ${document.filename}\n\nExtract: ${instructions}\n\nDocument text:\n${fullText}`,
      },
    ],
    response_format: zodResponseFormat(ExtractionResult, "extraction_result"),
  });

  const result = response.choices[0]?.message?.parsed;

  return NextResponse.json({
    documentId,
    filename: document.filename,
    extraction: result,
  });
}
