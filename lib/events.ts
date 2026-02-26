import { prisma } from "./prisma";
import { EventType } from "@prisma/client";

export async function logEvent(params: {
  repId: number;
  type: EventType;
  meta?: unknown;
  userAgent?: string | null;
  ip?: string | null;
}) {
  const { repId, type, meta, userAgent, ip } = params;
  try {
    await prisma.event.create({
      data: {
        repId,
        type,
        meta: meta as object ?? undefined,
        userAgent: userAgent ?? undefined,
        ip: ip ?? undefined,
      },
    });
  } catch (e) {
    console.warn("logEvent failed:", e);
  }
}
