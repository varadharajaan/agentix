import { deleteMemory, listMemories } from "@/lib/memory/store";

export const runtime = "nodejs";

// Single-user demo - see app/api/chat/route.ts for notes on multi-user support.
const USER_ID = "local-user";

export async function GET() {
  return Response.json({ memories: listMemories(USER_ID) });
}

/** Manual forget: lets the user delete a memory directly from the UI. */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "`id` query param is required" }, { status: 400 });
  }

  const memory = deleteMemory(id);
  if (!memory) {
    return Response.json({ error: "Memory not found" }, { status: 404 });
  }

  return Response.json({ memory });
}
