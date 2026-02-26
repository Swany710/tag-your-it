import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/events";
import { sendLeadNotification } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/leads — public lead capture (from rep landing page)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const repId = Number(body.repId);
  const name = String(body.name ?? "").trim();
  const phone = body.phone ? String(body.phone).trim() : null;
  const email = body.email ? String(body.email).trim() : null;
  const address = body.address ? String(body.address).trim() : null;
  const city = body.city ? String(body.city).trim() : null;
  const state = body.state ? String(body.state).trim() : null;
  const zip = body.zip ? String(body.zip).trim() : null;
  const notes = body.notes ? String(body.notes).trim() : null;

  if (!Number.isInteger(repId) || repId <= 0) {
    return NextResponse.json({ error: "Invalid repId" }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!phone && !email) {
    return NextResponse.json({ error: "Phone or email required" }, { status: 400 });
  }

  const rep = await prisma.rep.findUnique({ where: { id: repId } });
  if (!rep || !rep.isActive) {
    return NextResponse.json({ error: "Rep not found" }, { status: 404 });
  }

  const userAgent = req.headers.get("user-agent");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const lead = await prisma.lead.create({
    data: {
      repId,
      name,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      zip: zip || undefined,
      notes: notes || undefined,
      source: "nfc",
      userAgent: userAgent ?? undefined,
      ip: ip ?? undefined,
    },
  });

  await logEvent({ repId, type: "SUBMIT", meta: { leadId: lead.id }, userAgent, ip });

  // Fire email notification (non-blocking)
  sendLeadNotification({
    repName: rep.name,
    repEmail: rep.email,
    leadName: lead.name,
    leadPhone: lead.phone ?? null,
    leadEmail: lead.email ?? null,
    leadAddress: lead.address ?? null,
    leadNotes: lead.notes ?? null,
  }).catch(() => {});

  return NextResponse.json({ ok: true, leadId: lead.id });
}

// GET /api/leads — admin only, list all leads
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const repId = searchParams.get("repId");
  const status = searchParams.get("status");
  const limit = Number(searchParams.get("limit") ?? "100");
  const skip = Number(searchParams.get("skip") ?? "0");

  const where: Record<string, unknown> = {};
  if (repId) where.repId = Number(repId);
  if (status) where.status = status;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { rep: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ leads, total });
}
