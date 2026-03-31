import { prisma } from "@/lib/prisma";

export async function addOrderTimeline(params: {
  orderId: string;
  title: string;
  description?: string;
}) {
  await prisma.orderTimeline.create({
    data: {
      orderId: params.orderId,
      title: params.title,
      description: params.description || null,
    },
  });
}
