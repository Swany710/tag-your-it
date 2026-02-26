import { NextRequest, NextResponse } from "next/server";
import { logEvent } from "@/lib/events";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EventType } from "@prisma/client";

// POST /api/events — public event tracking
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.repId !== "number" || typeof body.type !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const validTypes: EventType[] = ["TAP", "VIEW", "SUBMIT", "CONTACT_SAVE"];
  const type = body.type.toUpperCase() as EventType;
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const userAgent = req.headers.get("user-agent");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await logEvent({ repId: body.repId, type, meta: body.meta, userAgent, ip });

  return NextResponse.json({ ok: true });
}

// GET /api/events — admin analytics
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const repId = searchParams.get("repId");
  const days = Number(searchParams.get("days") ?? "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const where: Record<string, unknown> = {
    createdAt: { gte: since },
  };
  if (repId) where.repId = Number(repId);

  // Summary stats
  const [taps, views, submits, byRep] = await Promise.all([
    prisma.event.count({ where: { ...where, type: "TAP" } }),
    prisma.event.count({ where: { ...where, type: "VIEW" } }),
    prisma.event.count({ where: { ...where, type: "SUBMIT" } }),
    prisma.event.groupBy({
      by: ["repId", "type"],
      where,
      _count: true,
    }),
  ]);

  // Daily tap chart data
  const rawEvents = await prisma.event.findMany({
    where: { ...where, type: "TAP" },
    select: { createdAt: true, repId: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const byDay: Record<string, number> = {};
  for (const e of rawEvents) {
    const day = e.createdAt.toISOString().split("T")[0];
    byDay[day] = (byDay[day] ?? 0) + 1;
  }
  const dailyChart = Object.entries(byDay).map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    summary: { taps, views, submits, conversionRate: taps > 0 ? ((submits / taps) * 100).toFixed(1) : "0" },
    byRep,
    dailyChart,
  });
}
