import { listDatabaseFiles, saveDatabaseFile } from "@/lib/database-files";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: await listDatabaseFiles() });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to load databases." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new Error("Choose a database file to upload.");
    }

    return NextResponse.json(
      { success: true, data: await saveDatabaseFile(file) },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed.",
      },
      { status: 400 },
    );
  }
}
