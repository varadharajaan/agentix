import { NextRequest, NextResponse } from "next/server";
import { ingestRepository } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300; // large repos take a while to embed

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { error: "Please upload a .zip archive of your repository." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const repoName = file.name.replace(/\.zip$/i, "");

    const { repoId } = await ingestRepository(repoName, buffer);

    return NextResponse.json({ repoId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
