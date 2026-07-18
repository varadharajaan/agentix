import { createDocument, deleteDocument, getDocument, listDocuments } from "@/lib/rag/store";
import { ingestDocument } from "@/lib/rag/ingest";
import { invalidateVectorStore } from "@/lib/rag/vectorstore";
import type { IngestEvent } from "@/lib/rag/types";

export const runtime = "nodejs";
// Ingesting a large document (extract + chunk + embed) can take a while.
export const maxDuration = 300;

export async function GET() {
  return Response.json({ documents: listDocuments() });
}

/** Phase 1: upload a document; streams ingestion progress as NDJSON. */
export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart/form-data with a `file` field" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "`file` field is required" }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OPENAI_API_KEY is not configured on the server" }, { status: 500 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const title = file.name.replace(/\.[^/.]+$/, "");
  const document = createDocument({
    title,
    filename: file.name,
    mimeType: file.type || "text/plain",
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: IngestEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      emit({ type: "document", document });

      try {
        await ingestDocument(
          document.id,
          { buffer, mimeType: document.mimeType, filename: document.filename },
          emit
        );
      } catch (err) {
        emit({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown ingestion error",
        });
      } finally {
        const finalDoc = getDocument(document.id);
        if (finalDoc) emit({ type: "document", document: finalDoc });
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/** Phase (management): remove a document and its chunks from the knowledge base. */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "`id` query param is required" }, { status: 400 });
  }

  const deleted = deleteDocument(id);
  if (!deleted) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  invalidateVectorStore();
  return Response.json({ deleted: true, id });
}
