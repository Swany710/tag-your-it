import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeRepLandingTemplate } from "@/lib/repLandingTemplate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const page = await prisma.repLandingPage.findUnique({ where: { id: 1 } });
    return NextResponse.json({ page: normalizeRepLandingTemplate(page) });
  } catch {
    return NextResponse.json({ page: normalizeRepLandingTemplate() });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const data = normalizeRepLandingTemplate(body);

  try {
    const page = await prisma.repLandingPage.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    return NextResponse.json({ page: normalizeRepLandingTemplate(page) });
  } catch {
    return NextResponse.json(
      {
        error:
          "Rep landing template storage is not ready yet. Run prisma db push, then try saving again.",
      },
      { status: 500 }
    );
  }
}
