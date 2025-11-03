// WHY: Deep link route for QR code scans
// WHAT: Finds container by code and redirects to its detail page
// HOW: Server component that queries DB by code, redirects to /containers/[id]

import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

interface QRRedirectPageProps {
  params: { code: string };
}

export default async function QRRedirectPage({ params }: QRRedirectPageProps) {
  const container = await prisma.container.findUnique({
    where: { code: params.code },
  });

  if (!container) return notFound();

  // WHY: Redirect to the full container detail page
  redirect(`/containers/${container.id}`);
}
