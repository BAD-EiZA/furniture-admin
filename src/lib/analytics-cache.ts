import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function getAdminAnalyticsSummary() {
  const cacheKey = "admin:analytics:summary";

  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const [
    confirmedOrders,
    rejectedOrders,
    waitingOrders,
    pendingOrders,
    totalCustomers,
    revenueAggregate,
    topProductsRaw,
    topSalesRaw,
    paymentMethodRaw,
    orderItems,
  ] = await Promise.all([
    prisma.order.count({
      where: { status: "CONFIRMED" },
    }),
    prisma.order.count({
      where: { status: "REJECTED" },
    }),
    prisma.order.count({
      where: { status: "WAITING_CONFIRMATION" },
    }),
    prisma.order.count({
      where: { status: "PENDING_PAYMENT" },
    }),
    prisma.customer.count(),
    prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: "CONFIRMED",
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
        readyQty: true,
        poQty: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ["salesId"],
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
      where: {
        status: "CONFIRMED",
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 5,
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
    prisma.orderItem.aggregate({
      _sum: {
        readyQty: true,
        poQty: true,
        quantity: true,
      },
    }),
  ]);

  const productIds = topProductsRaw.map((item) => item.productId);
  const salesIds = topSalesRaw.map((item) => item.salesId);

  const [products, sales] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { id: { in: salesIds } },
      select: { id: true, name: true },
    }),
  ]);

  const data = {
    confirmedOrders,
    rejectedOrders,
    waitingOrders,
    pendingOrders,
    totalCustomers,
    revenue: Number(revenueAggregate._sum.total || 0),
    totalReadyQty: Number(orderItems._sum.readyQty || 0),
    totalPoQty: Number(orderItems._sum.poQty || 0),
    totalQty: Number(orderItems._sum.quantity || 0),
    topProductsRaw: topProductsRaw.map((row) => ({
      productId: row.productId,
      _sum: {
        quantity: Number(row._sum.quantity || 0),
        readyQty: Number(row._sum.readyQty || 0),
        poQty: Number(row._sum.poQty || 0),
        subtotal: Number(row._sum.subtotal || 0),
      },
    })),
    topSalesRaw: topSalesRaw.map((row) => ({
      salesId: row.salesId,
      _count: { id: row._count.id },
      _sum: { total: Number(row._sum.total || 0) },
    })),
    paymentMethodRaw: paymentMethodRaw.map((row) => ({
      paymentMethod: row.paymentMethod,
      _count: { id: row._count.id },
      _sum: { total: Number(row._sum.total || 0) },
    })),
    products,
    sales,
  };

  await setCache(cacheKey, data, 180);

  return data;
}
