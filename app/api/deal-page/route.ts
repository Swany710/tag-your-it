import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/deal-page — public: fetch current deals page content
export async function GET() {
  const page = await prisma.dealPage.findUnique({ where: { id: 1 } });
  return NextResponse.json({ page });
}

// PUT /api/deal-page — admin: update deals page content
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const allowed = ["isLive", "badge", "headline", "subheadline", "body", "ctaText", "ctaUrl", "companyName", "logoUrl"];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const page = await prisma.dealPage.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  return NextResponse.json({ page });
}
