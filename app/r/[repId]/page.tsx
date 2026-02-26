import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import RepLandingClient from "./RepLandingClient";

interface Props {
  params: { repId: string };
}

export default async function RepPage({ params }: Props) {
  const repId = Number(params.repId);
  if (!Number.isInteger(repId) || repId <= 0) return notFound();

  const rep = await prisma.rep.findUnique({ where: { id: repId } });
  if (!rep || !rep.isActive) return notFound();

  // If a redirect URL is set, log the tap server-side then bounce
  if (rep.redirectUrl) {
    // Fire-and-forget tap log
    prisma.event.create({
      data: { repId, type: "TAP", meta: { path: `/r/${repId}`, redirected: true } },
    }).catch(() => {});

    redirect(rep.redirectUrl);
  }

  return <RepLandingClient rep={{
    id: rep.id,
    name: rep.name,
    phone: rep.phone,
    email: rep.email,
    title: rep.title,
    company: rep.company,
    bio: rep.bio,
    photoUrl: rep.photoUrl,
    calLink: rep.calLink,
  }} />;
}
