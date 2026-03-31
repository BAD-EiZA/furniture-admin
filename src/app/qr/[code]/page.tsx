import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function QrRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const product = await prisma.product.findUnique({
    where: { qrCodeValue: code },
  });

  if (!product) {
    notFound();
  }

  redirect(`/p/${product.slug}`);
}
