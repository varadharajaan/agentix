import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ensureSessionDir } from "@/lib/fs-utils";

export async function POST() {
  const sessionId = randomUUID();
  await ensureSessionDir(sessionId);
  return NextResponse.json({ sessionId });
}
