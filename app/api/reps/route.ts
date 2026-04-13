import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/reps - admin: list all reps
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const includeStats = searchParams.get("stats") === "true";

  const reps = await prisma.rep.findMany({
    orderBy: { id: "asc" },
    include: {
      _count: {
        select: { leads: true, events: true },
      },
    },
  });

  if (!includeStats) return NextResponse.json({ reps });

  const enriched = await Promise.all(
    reps.map(async (rep) => {
      const [taps, submits] = await Promise.all([
        prisma.event.count({ where: { repId: rep.id, type: "TAP" } }),
        prisma.event.count({ where: { repId: rep.id, type: "SUBMIT" } }),
      ]);

      return {
        ...rep,
        stats: {
          taps,
          submits,
          leads: rep._count.leads,
          conversionRate: taps > 0 ? ((submits / taps) * 100).toFixed(1) : "0",
        },
      };
    })
  );

  return NextResponse.json({ reps: enriched });
}

// POST /api/reps - admin: assign a rep to one of the 25 fixed slots
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const repId = Number(body.id);
  const name = String(body.name ?? "").trim();

  if (!Number.isInteger(repId)) {
    return NextResponse.json({ error: "A valid rep slot ID is required" }, { status: 400 });
  }

  if (repId < 1 || repId > 25) {
    return NextResponse.json({ error: "Rep slot IDs must stay between 1 and 25" }, { status: 400 });
  }

  if (name.length < 2) {
    return NextResponse.json({ error: "A rep name is required" }, { status: 400 });
  }

  const existing = await prisma.rep.findUnique({ where: { id: repId } });
  const isPlaceholder =
    !!existing &&
    existing.name === `Rep ${repId}` &&
    !existing.phone &&
    !existing.email &&
    !existing.bio &&
    !existing.photoUrl &&
    !existing.calLink &&
    !existing.redirectUrl &&
    !existing.isActive;

  if (existing && !isPlaceholder) {
    return NextResponse.json(
      { error: "Rep slot already assigned. Edit the existing slot from the reps list." },
      { status: 409 }
    );
  }

  const data = {
    name,
    phone: body.phone ? String(body.phone) : undefined,
    email: body.email ? String(body.email) : undefined,
    title: body.title ? String(body.title) : existing?.title || undefined,
    company: body.company ? String(body.company) : existing?.company || undefined,
    bio: body.bio ? String(body.bio) : undefined,
    photoUrl: body.photoUrl ? String(body.photoUrl) : undefined,
    calLink: body.calLink ? String(body.calLink) : undefined,
    isActive: true,
  };

  if (existing) {
    const rep = await prisma.rep.update({
      where: { id: repId },
      data,
    });

    return NextResponse.json({ rep });
  }

  const rep = await prisma.rep.create({
    data: {
      id: repId,
      ...data,
    },
  });

  return NextResponse.json({ rep }, { status: 201 });
}
