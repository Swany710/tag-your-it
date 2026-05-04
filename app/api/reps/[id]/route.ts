import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/reps/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rep = await prisma.rep.findUnique({
    where: { id: Number(params.id) },
    include: {
      leads: { orderBy: { createdAt: "desc" }, take: 20 },
      tags: true,
      _count: { select: { leads: true, events: true } },
    },
  });

  if (!rep) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ rep });
}

// PATCH /api/reps/[id] - update rep
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const allowed = [
    "name",
    "phone",
    "officePhone",
    "email",
    "title",
    "company",
    "bio",
    "photoUrl",
    "websiteLabel",
    "websiteUrl",
    "address",
    "calLink",
    "isActive",
    "redirectUrl",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (!(key in body)) continue;

    if (key === "isActive") {
      data[key] = Boolean(body[key]);
      continue;
    }

    if (typeof body[key] === "string") {
      const trimmed = body[key].trim();
      data[key] = key === "name" ? trimmed : trimmed || null;
      continue;
    }

    data[key] = body[key];
  }

  if ("name" in data && typeof data.name === "string" && data.name.length < 2) {
    return NextResponse.json({ error: "A rep name is required" }, { status: 400 });
  }

  const rep = await prisma.rep.update({
    where: { id: Number(params.id) },
    data,
  });

  return NextResponse.json({ rep });
}

// DELETE /api/reps/[id] - soft delete (deactivate)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rep = await prisma.rep.update({
    where: { id: Number(params.id) },
    data: { isActive: false },
  });

  return NextResponse.json({ rep });
}
