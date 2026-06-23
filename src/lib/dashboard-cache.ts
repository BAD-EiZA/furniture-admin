import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function getAdminDashboardSummary() {
  const cacheKey = "admin:dashboard:summary";

  const cached = await getCache<{
    productCount: number;
    adminCount: number;
    salesCount: number;
    orderCount: number;
    confirmedRevenue: number;
    confirmedOrders: number;
    rejectedOrders: number;
    shippedOrders: number;
    waitingOrders: number;
    pendingOrders: number;
    paymentMethodRaw: {
      paymentMethod: string;
      _count: { id: number };
      _sum: { total: number | null };
    }[];
  }>(cacheKey);

  if (cached) return cached;

  const [
    productCount,
    adminCount,
    salesCount,
    orderCount,
    confirmedRevenue,
    confirmedOrders,
    rejectedOrders,
    shippedOrders,
    waitingOrders,
    pendingOrders,
    paymentMethodRaw,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({
      where: {
        role: {
          in: ["SUPER_ADMIN", "ADMIN"],
        },
      },
    }),
    prisma.user.count({
      where: { role: "SALES" },
    }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: "CONFIRMED",
      },
    }),
    prisma.order.count({
      where: { status: "CONFIRMED" },
    }),
    prisma.order.count({
      where: { status: "REJECTED" },
    }),
    prisma.order.count({
      where: { status: "SHIPPED" },
    }),
    prisma.order.count({
      where: { status: "WAITING_CONFIRMATION" },
    }),
    prisma.order.count({
      where: { status: "PENDING_PAYMENT" },
    }),
    prisma.order.groupBy({
      by: ["paymentMethod"],
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  const data = {
    productCount,
    adminCount,
    salesCount,
    orderCount,
    confirmedRevenue: Number(confirmedRevenue._sum.total || 0),
    confirmedOrders,
    rejectedOrders,
    shippedOrders,
    waitingOrders,
    pendingOrders,
    paymentMethodRaw: paymentMethodRaw.map((item) => ({
      paymentMethod: item.paymentMethod,
      _count: { id: item._count.id },
      _sum: { total: Number(item._sum.total || 0) },
    })),
  };

  await setCache(cacheKey, data, 120);

  return data;
}