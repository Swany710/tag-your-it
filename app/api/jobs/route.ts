import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/jobs — list all jobs
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    include: { tags: true },
    orderBy: { completionDate: "desc" },
  });

  return NextResponse.json({ jobs });
}

// POST /api/jobs — create a job completion record
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  if (!body.homeownerName || !body.address) {
    return NextResponse.json({ error: "homeownerName and address required" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      jobNumber: body.jobNumber || undefined,
      homeownerName: body.homeownerName,
      address: body.address,
      city: body.city || undefined,
      state: body.state || undefined,
      zip: body.zip || undefined,
      phone: body.phone || undefined,
      email: body.email || undefined,
      completionDate: body.completionDate ? new Date(body.completionDate) : undefined,
      shingleType: body.shingleType || undefined,
      shingleColor: body.shingleColor || undefined,
      manufacturer: body.manufacturer || undefined,
      warrantyYears: body.warrantyYears ? Number(body.warrantyYears) : undefined,
      warrantyCode: body.warrantyCode || undefined,
      repId: body.repId ? Number(body.repId) : undefined,
      notes: body.notes || undefined,
      droneVideoUrl: body.droneVideoUrl || undefined,
      photoUrls: body.photoUrls || [],
    },
  });

  return NextResponse.json({ job }, { status: 201 });
}
