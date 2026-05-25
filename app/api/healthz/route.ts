import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // Verify the database is reachable — Railway uses this to gate deploys.
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, time: new Date().toISOString() });
  } catch (err) {
    console.error("[healthz] DB ping failed:", err);
    return NextResponse.json(
      { ok: false, error: "database unavailable" },
      { status: 503 }
    );
  }
}
