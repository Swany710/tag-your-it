import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/documents — list all documents (metadata only, no raw bytes)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = await prisma.document.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      filename: true,
      mimeType: true,
      sizeBytes: true,
      uploadedAt: true,
      updatedAt: true,
    },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ documents: docs });
}

// POST /api/documents — upload a new PDF
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const name = (form.get("name") as string | null)?.trim() || "";
    const description = (form.get("description") as string | null)?.trim() || null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
    }

    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const doc = await prisma.document.create({
      data: {
        name,
        description,
        filename: file.name,
        mimeType: file.type || "application/pdf",
        data: buffer,
        sizeBytes: buffer.length,
      },
      select: { id: true, name: true, filename: true, sizeBytes: true, uploadedAt: true },
    });

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (err) {
    console.error("[documents] upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}