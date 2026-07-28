import { NextRequest, NextResponse } from "next/server";

import { createDocument, listDocuments } from "@/lib/db/documents";
import { detectFileType } from "@/lib/processing/extract";
import { processDocument } from "@/lib/processing/pipeline";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function GET() {
  const documents = listDocuments();
  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided." }, { status: 400 });
  }

  const created = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `${file.name} exceeds the 25MB limit.` },
        { status: 413 }
      );
    }

    const fileType = detectFileType(file.name, file.type);
    const document = createDocument({
      filename: file.name,
      fileType,
      mimeType: file.type || null,
      sizeBytes: file.size,
    });

    created.push(document);

    // Kick off processing without blocking the response; the client polls
    // GET /api/documents (or /api/documents/[id]) for status updates.
    const buffer = Buffer.from(await file.arrayBuffer());
    processDocument(document.id, buffer, fileType).catch((err) => {
      console.error(`[documents] processing failed for ${document.id}:`, err);
    });
  }

  return NextResponse.json({ documents: created }, { status: 201 });
}
