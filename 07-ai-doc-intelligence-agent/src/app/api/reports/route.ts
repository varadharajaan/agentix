import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getDocument } from "@/lib/db/documents";
import { getChunksForDocument } from "@/lib/db/chunks";
import { CHAT_MODEL, openai } from "@/lib/ai/openai";

export const runtime = "nodejs";

const requestSchema = z.object({
  documentIds: z.array(z.string()).min(1),
  reportType: z.enum(["executive_summary", "detailed_report"]).default("executive_summary"),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { documentIds, reportType } = parsed.data;

  const documents = documentIds.map((id) => getDocument(id)).filter((d) => d !== null);
  if (documents.length !== documentIds.length) {
    return NextResponse.json({ error: "One or more documents were not found." }, { status: 404 });
  }

  const context = documents
    .map((doc) => {
      const chunks = getChunksForDocument(doc.id);
      // Cap per-document text so a report over many/long documents stays
      // within a reasonable prompt size; the model still sees full
      // coverage via evenly-sampled chunks rather than a truncated head.
      const sampled = chunks.length > 30 ? sampleEvenly(chunks, 30) : chunks;
      const text = sampled.map((c) => c.content).join("\n\n");
      return `=== ${doc.filename} ===\n${text}`;
    })
    .join("\n\n");

  const instructions =
    reportType === "executive_summary"
      ? "Write a concise executive summary (roughly 200-350 words): key points, notable figures, and any risks or action items. Use short paragraphs, no headers needed for a summary this short."
      : "Write a detailed report with clear markdown section headers: Overview, Key Findings, Figures & Data, Risks/Open Questions, and Recommendations. Ground every claim in the source material.";

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You write professional reports for a document-intelligence tool, grounded strictly in the provided source text. Do not invent facts not present in the sources.",
      },
      {
        role: "user",
        content: `${context}\n\n${instructions}`,
      },
    ],
  });

  const report = response.choices[0]?.message?.content ?? "";

  return NextResponse.json({
    documents: documents.map((d) => ({ id: d.id, filename: d.filename })),
    reportType,
    report,
  });
}

function sampleEvenly<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const step = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * step)]);
}
