import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/reps — admin: list all reps
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

  // Attach conversion stats per rep
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

// POST /api/reps — admin: create new rep
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  if (!body.id || !body.name) {
    return NextResponse.json({ error: "id and name are required" }, { status: 400 });
  }

  const existing = await prisma.rep.findUnique({ where: { id: Number(body.id) } });
  if (existing) return NextResponse.json({ error: "Rep ID already exists" }, { status: 409 });

  const rep = await prisma.rep.create({
    data: {
      id: Number(body.id),
      name: String(body.name),
      phone: body.phone || undefined,
      email: body.email || undefined,
      title: body.title || undefined,
      company: body.company || undefined,
      bio: body.bio || undefined,
      photoUrl: body.photoUrl || undefined,
      calLink: body.calLink || undefined,
    },
  });

  return NextResponse.json({ rep }, { status: 201 });
}
