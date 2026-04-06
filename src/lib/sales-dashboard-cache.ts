import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function getSalesDashboardSummary(userId: string) {
  const cacheKey = `sales:dashboard:${userId}`;

  const cached = await getCache<{
    totalOrders: number;
    waitingOrders: number;
    confirmedOrders: number;
    invoiceSentOrders: number;
    recentOrders: any[];
  }>(cacheKey);

  if (cached) return cached;

  const [
    totalOrders,
    waitingOrders,
    confirmedOrders,
    invoiceSentOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: { salesId: userId },
    }),
    prisma.order.count({
      where: {
        salesId: userId,
        status: "WAITING_CONFIRMATION",
      },
    }),
    prisma.order.count({
      where: {
        salesId: userId,
        status: "CONFIRMED",
      },
    }),
    prisma.order.count({
      where: {
        salesId: userId,
        status: "INVOICE_SENT",
      },
    }),
    prisma.order.findMany({
      where: {
        salesId: userId,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        items: {
          include: { product: true },
        },
        paymentProof: true,
        invoice: true,
      },
    }),
  ]);

  const data = {
    totalOrders,
    waitingOrders,
    confirmedOrders,
    invoiceSentOrders,
    recentOrders,
  };

  await setCache(cacheKey, data, 120);

  return data;
}
