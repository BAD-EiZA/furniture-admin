import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const [
    confirmedOrders,
    rejectedOrders,
    confirmedTotal,
    topProducts,
    topSales,
    newCustomers,
  ] = await Promise.all([
    prisma.order.count({
      where: { status: "CONFIRMED" },
    }),
    prisma.order.count({
      where: { status: "REJECTED" },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "CONFIRMED" },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
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
      where: { status: "CONFIRMED" },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    }),
    prisma.customer.count(),
  ]);

  const productIds = topProducts.map((item) => item.productId);
  const salesIds = topSales.map((item) => item.salesId);

  const [productRecords, salesRecords] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
    }),
    prisma.user.findMany({
      where: { id: { in: salesIds } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-slate-500">Ringkasan performa bisnis</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Confirmed Orders</p>
          <h2 className="mt-2 text-3xl font-bold">{confirmedOrders}</h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Rejected Orders</p>
          <h2 className="mt-2 text-3xl font-bold">{rejectedOrders}</h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Total Omzet</p>
          <h2 className="mt-2 text-3xl font-bold">
            Rp {Number(confirmedTotal._sum.total || 0).toLocaleString("id-ID")}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Total Customer</p>
          <h2 className="mt-2 text-3xl font-bold">{newCustomers}</h2>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold">Top Products</h2>
          <div className="space-y-3">
            {topProducts.map((row) => {
              const product = productRecords.find(
                (p) => p.id === row.productId,
              );
              return (
                <div
                  key={row.productId}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <span>{product?.name || row.productId}</span>
                  <span className="font-medium">
                    {row._sum.quantity || 0} terjual
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold">Top Sales</h2>
          <div className="space-y-3">
            {topSales.map((row) => {
              const sales = salesRecords.find((s) => s.id === row.salesId);
              return (
                <div
                  key={row.salesId}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <span>{sales?.name || row.salesId}</span>
                  <span className="font-medium">{row._count.id} confirmed</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
