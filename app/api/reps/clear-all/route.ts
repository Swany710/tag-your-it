import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/reps/clear-all - wipe every rep slot back to a blank template
export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cleared = {
    name: "Unassigned",
    phone: null,
    officePhone: null,
    email: null,
    title: null,
    company: null,
    bio: null,
    photoUrl: null,
    websiteLabel: null,
    websiteUrl: null,
    address: null,
    calLink: null,
    redirectUrl: null,
    isActive: false,
  };

  await prisma.rep.updateMany({ data: cleared });

  const reps = await prisma.rep.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ cleared: reps.length, reps });
}
