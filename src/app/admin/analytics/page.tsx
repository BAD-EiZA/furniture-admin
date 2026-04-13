import {
  BarChart3,
  CircleDollarSign,
  ShoppingCart,
  Users,
  Truck,
  PackageCheck,
  Clock3,
  XCircle,
  CreditCard,
} from "lucide-react";

import AdminAnalyticsCharts from "@/components/admin-analytics-charts";
import { getAdminAnalyticsSummary } from "@/lib/analytics-cache";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatPaymentMethod(method: string) {
  if (method === "TRANSFER") return "Transfer";
  if (method === "COD") return "COD";
  if (method === "TEMPO") return "Tempo";
  return method;
}

export default async function AnalyticsPage() {
  const analytics = await getAdminAnalyticsSummary();

  const topProductsRaw = analytics?.topProductsRaw || [];
  const topSalesRaw = analytics?.topSalesRaw || [];
  const paymentMethodRaw = analytics?.paymentMethodRaw || [];

  const revenue = Number(analytics?.revenueAggregate?._sum?.total || 0);
  const totalReadyQty = Number(analytics?.orderItems?._sum?.readyQty || 0);
  const totalPoQty = Number(analytics?.orderItems?._sum?.poQty || 0);
  const totalQty = Number(analytics?.orderItems?._sum?.quantity || 0);

  const confirmedOrders = Number(analytics?.confirmedOrders || 0);
  const rejectedOrders = Number(analytics?.rejectedOrders || 0);
  const waitingOrders = Number(analytics?.waitingOrders || 0);
  const pendingOrders = Number(analytics?.pendingOrders || 0);
  const totalCustomers = Number(analytics?.totalCustomers || 0);

  const productIds = topProductsRaw.map((item: any) => item.productId).filter(Boolean);
  const salesIds = topSalesRaw.map((item: any) => item.salesId).filter(Boolean);

  const [products, sales] = await Promise.all([
    productIds.length
      ? prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        select: {
          id: true,
          name: true,
        },
      })
      : [],
    salesIds.length
      ? prisma.user.findMany({
        where: {
          id: { in: salesIds },
        },
        select: {
          id: true,
          name: true,
        },
      })
      : [],
  ]);

  const summaryCards = [
    {
      title: "Omzet Terkonfirmasi",
      value: formatCurrency(revenue),
      icon: CircleDollarSign,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Total Pelanggan",
      value: totalCustomers.toString(),
      icon: Users,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Pesanan Berhasil",
      value: confirmedOrders.toString(),
      icon: PackageCheck,
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Pesanan Ditolak",
      value: rejectedOrders.toString(),
      icon: XCircle,
      color: "bg-red-50 text-red-700",
    },
    {
      title: "Menunggu Konfirmasi",
      value: waitingOrders.toString(),
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Menunggu Pembayaran",
      value: pendingOrders.toString(),
      icon: ShoppingCart,
      color: "bg-slate-100 text-slate-700",
    },
  ];

  const paymentMethodData = paymentMethodRaw.map((item: any) => ({
    name: formatPaymentMethod(item.paymentMethod),
    orders: Number(item?._count?.id || 0),
    total: Number(item?._sum?.total || 0),
  }));

  const statusData = [
    { name: "Terkonfirmasi", value: confirmedOrders },
    { name: "Ditolak", value: rejectedOrders },
    { name: "Menunggu", value: waitingOrders },
    { name: "Pending", value: pendingOrders },
  ];

  const stockData = [
    { name: "Stok Ready", value: totalReadyQty },
    { name: "Stok PO", value: totalPoQty },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Analitik</h1>
            <p className="text-sm text-slate-500">
              Ringkasan performa penjualan, stok ready vs PO, dan metode pembayaran.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Ringkasan Kuantitas
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total Kuantitas</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {totalQty}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm text-green-700">Kuantitas Ready</p>
              <p className="mt-2 text-2xl font-bold text-green-800">
                {totalReadyQty}
              </p>
            </div>

            <div className="rounded-2xl bg-yellow-50 p-4">
              <p className="text-sm text-yellow-700">Kuantitas PO</p>
              <p className="mt-2 text-2xl font-bold text-yellow-800">
                {totalPoQty}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Metode Pembayaran
          </h2>

          <div className="mt-5 space-y-3">
            {paymentMethodRaw.map((item: any) => (
              <div
                key={item.paymentMethod}
                className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {formatPaymentMethod(item.paymentMethod)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {Number(item?._count?.id || 0)} pesanan
                    </p>
                  </div>
                </div>

                <p className="font-semibold text-slate-900">
                  {formatCurrency(Number(item?._sum?.total || 0))}
                </p>
              </div>
            ))}

            {paymentMethodRaw.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada data metode pembayaran.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <AdminAnalyticsCharts
          paymentMethodData={paymentMethodData}
          statusData={statusData}
          stockData={stockData}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-700" />
            <h2 className="text-lg font-semibold text-slate-950">Produk Terlaris</h2>
          </div>

          <div className="mt-5 space-y-3">
            {topProductsRaw.map((row: any) => {
              const product = products.find((p) => p.id === row.productId);

              return (
                <div
                  key={row.productId}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {product?.name || row.productId}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Jml: {Number(row?._sum?.quantity || 0)} • Ready:{" "}
                        {Number(row?._sum?.readyQty || 0)} • PO:{" "}
                        {Number(row?._sum?.poQty || 0)}
                      </p>
                    </div>

                    <p className="font-semibold text-slate-900">
                      {formatCurrency(Number(row?._sum?.subtotal || 0))}
                    </p>
                  </div>
                </div>
              );
            })}

            {topProductsRaw.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada data produk.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-700" />
            <h2 className="text-lg font-semibold text-slate-950">Sales Terbaik</h2>
          </div>

          <div className="mt-5 space-y-3">
            {topSalesRaw.map((row: any) => {
              const salesUser = sales.find((s) => s.id === row.salesId);

              return (
                <div
                  key={row.salesId}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {salesUser?.name || row.salesId}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {Number(row?._count?.id || 0)} pesanan terkonfirmasi
                      </p>
                    </div>

                    <p className="font-semibold text-slate-900">
                      {formatCurrency(Number(row?._sum?.total || 0))}
                    </p>
                  </div>
                </div>
              );
            })}

            {topSalesRaw.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada data sales.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}