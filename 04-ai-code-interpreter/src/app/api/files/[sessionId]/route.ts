import { NextRequest, NextResponse } from "next/server";
import { assertValidSessionId, listSessionFiles } from "@/lib/fs-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  try {
    assertValidSessionId(sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }
  const files = await listSessionFiles(sessionId);
  return NextResponse.json({ files });
}
