import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/tags
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const tags = await prisma.tag.findMany({
    where: type ? { type: type as "REP" | "JOB" | "TRADESHOW" | "STATIC" } : undefined,
    include: { rep: { select: { id: true, name: true } }, job: { select: { id: true, homeownerName: true, address: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tags });
}

// POST /api/tags
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const tag = await prisma.tag.create({
    data: {
      uid: body.uid || undefined,
      label: body.label || undefined,
      type: body.type || "REP",
      repId: body.repId ? Number(body.repId) : undefined,
      jobId: body.jobId || undefined,
      notes: body.notes || undefined,
    },
  });

  return NextResponse.json({ tag }, { status: 201 });
}
