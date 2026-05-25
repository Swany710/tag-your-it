import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: { id: string } };

// GET /api/documents/[id] - serve the raw PDF bytes (public, no auth needed to view)
export async function GET(_req: Request, { params }: Ctx) {
  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    select: { data: true, mimeType: true, filename: true, sizeBytes: true },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new Response(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": doc.sizeBytes.toString(),
      "Content-Disposition": 'inline; filename="' + doc.filename + '"',
      "Cache-Control": "private, max-age=60",
    },
  });
}

// DELETE /api/documents/[id]
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await prisma.document.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

// PATCH /api/documents/[id] - rename / update description
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const doc = await prisma.document.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined && { name: String(body.name).trim() }),
      ...(body.description !== undefined && { description: body.description ? String(body.description).trim() : null }),
    },
    select: { id: true, name: true, description: true },
  });
  return NextResponse.json({ document: doc });
}