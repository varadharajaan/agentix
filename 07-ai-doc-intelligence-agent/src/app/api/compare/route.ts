import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getDocument } from "@/lib/db/documents";
import { CHAT_MODEL, openai } from "@/lib/ai/openai";
import { semanticSearch } from "@/lib/ai/similarity";

export const runtime = "nodejs";

const requestSchema = z.object({
  documentIds: z.array(z.string()).min(2, "Select at least two documents to compare."),
  focus: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { documentIds, focus } = parsed.data;

  const documents = documentIds.map((id) => getDocument(id)).filter((d) => d !== null);
  if (documents.length !== documentIds.length) {
    return NextResponse.json({ error: "One or more documents were not found." }, { status: 404 });
  }
  if (documents.some((d) => d.status !== "ready")) {
    return NextResponse.json(
      { error: "All selected documents must finish processing before comparing." },
      { status: 409 }
    );
  }

  const query = focus?.trim() || "key terms, dates, obligations, and figures";

  // Pull broad, representative coverage from each document independently
  // so a comparison isn't dominated by whichever doc scores marginally
  // higher on a shared query.
  const perDocumentChunks = await Promise.all(
    documents.map((doc) => semanticSearch(query, { documentIds: [doc.id], topK: 10 }))
  );

  const context = documents
    .map((doc, i) => {
      const chunksText = perDocumentChunks[i]
        .map((r) => `(page ${r.chunk.pageNumber ?? "n/a"}) ${r.chunk.content}`)
        .join("\n\n");
      return `=== Document: ${doc.filename} ===\n${chunksText}`;
    })
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You compare documents for a document-intelligence tool. Using ONLY the excerpts given, identify what was added, removed, and modified between the documents (dates, terms, payment/obligation changes, etc). Structure your answer with clear headings per category. Reference each point back to its document by filename.",
      },
      {
        role: "user",
        content: `${context}\n\nFocus, if relevant: ${query}`,
      },
    ],
  });

  const comparison = response.choices[0]?.message?.content ?? "";

  return NextResponse.json({
    documents: documents.map((d) => ({ id: d.id, filename: d.filename })),
    comparison,
  });
}
