import Link from "next/link";
import {
  ArrowUpRight,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  Sparkles,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminDashboardCharts from "@/components/admin-dashboard-charts";
import { getAdminDashboardSummary } from "@/lib/dashboard-cache";

export default async function AdminDashboardPage() {
  const dashboardSummary = await getAdminDashboardSummary();

  const statCards = [
    {
      title: "Total Produk",
      value: dashboardSummary.productCount,
      icon: Package,
      hint: "Barang aktif di katalog",
      iconClass: "bg-[#eef4ff] text-[#125EA9]",
    },
    {
      title: "Total Order",
      value: dashboardSummary.orderCount,
      icon: ShoppingCart,
      hint: "Semua transaksi masuk",
      iconClass: "bg-[#eef2ff] text-[#2E4FAE]",
    },
    {
      title: "Admin",
      value: dashboardSummary.adminCount,
      icon: Users,
      hint: "Admin & super admin",
      iconClass: "bg-[#fff7e8] text-[#C89B3C]",
    },
    {
      title: "Sales",
      value: dashboardSummary.salesCount,
      icon: Wallet,
      hint: "Sales aktif",
      iconClass: "bg-[#edf8f2] text-[#1f7a55]",
    },
  ];

  const revenueData = dashboardSummary.paymentMethodRaw.map((item) => ({
    name:
      item.paymentMethod === "TRANSFER"
        ? "Transfer"
        : item.paymentMethod === "COD"
          ? "COD"
          : item.paymentMethod === "TEMPO"
            ? "Tempo"
            : item.paymentMethod,
    total: Number(item._sum.total || 0),
  }));

  const paymentMethodData = dashboardSummary.paymentMethodRaw.map((item) => ({
    name:
      item.paymentMethod === "TRANSFER"
        ? "Transfer"
        : item.paymentMethod === "COD"
          ? "COD"
          : item.paymentMethod === "TEMPO"
            ? "Tempo"
            : item.paymentMethod,
    value: item._count.id,
  }));

  const statusData = [
    { name: "Confirmed", value: dashboardSummary.confirmedOrders },
    { name: "Rejected", value: dashboardSummary.rejectedOrders },
    { name: "Waiting", value: dashboardSummary.waitingOrders },
    { name: "Pending", value: dashboardSummary.pendingOrders },
  ];

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      sales: true,
      items: {
        include: { product: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-[#d8e6f5] bg-gradient-to-br from-[#0d2f57] via-[#125EA9] to-[#2E4FAE] p-6 text-white shadow-2xl lg:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#C89B3C]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge className="mb-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-white hover:bg-white/10">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Dashboard Admin
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Kelola produk, transaksi, dan tim Hirona
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">
              Pantau performa operasional harian, status order, dan aktivitas tim
              dengan tampilan yang selaras dengan identitas Hirona.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="rounded-2xl bg-white text-[#125EA9] hover:bg-[#f8fbff]"
            >
              <Link href="/admin/products/new">Tambah Produk</Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="rounded-2xl border border-white/15 bg-[#C89B3C] text-white hover:bg-[#b88d33]"
            >
              <Link href="/admin/orders">
                Lihat Pesanan
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              className="overflow-hidden rounded-[24px] border-[#e3ebf5] bg-white shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardDescription className="text-slate-500">
                    {card.title}
                  </CardDescription>
                  <CardTitle className="mt-2 text-3xl font-bold text-slate-950">
                    {card.value}
                  </CardTitle>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-slate-500">{card.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section>
        <AdminDashboardCharts
          revenueData={revenueData}
          statusData={statusData}
          paymentMethodData={paymentMethodData}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="rounded-[24px] border-[#e3ebf5] bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-slate-950">Pesanan Terbaru</CardTitle>
            <CardDescription>
              5 transaksi paling baru yang masuk ke sistem
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Belum ada pesanan terbaru
              </div>
            ) : (
              recentOrders.map((order) => {
                const item = order.items[0];

                return (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">
                        {order.orderCode}
                      </p>
                      <p className="text-sm text-slate-500">
                        {order.customerNameDraft} • {item?.product.name} x{" "}
                        {item?.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="rounded-full border border-[#dce7f3] bg-[#eef4ff] px-3 py-1 text-[#125EA9]"
                      >
                        {order.status}
                      </Badge>

                      <Button
                        asChild
                        variant="outline"
                        className="rounded-xl border-[#dce7f3] text-[#125EA9] hover:bg-[#f4f9ff] hover:text-[#125EA9]"
                      >
                        <Link href={`/status/${order.orderCode}`}>Detail</Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-[#e3ebf5] bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-slate-950">Aksi Cepat</CardTitle>
            <CardDescription>
              Aksi cepat untuk operasional harian
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3">
            <Button
              asChild
              className="justify-between rounded-2xl bg-gradient-to-r from-[#0d2f57] via-[#125EA9] to-[#2E4FAE] text-white hover:opacity-95"
            >
              <Link href="/admin/products/new">
                Tambah Produk
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="justify-between rounded-2xl border-[#dce7f3] text-[#125EA9] hover:bg-[#f4f9ff] hover:text-[#125EA9]"
            >
              <Link href="/admin/orders">
                Kelola Pesanan
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="justify-between rounded-2xl border-[#dce7f3] text-[#125EA9] hover:bg-[#f4f9ff] hover:text-[#125EA9]"
            >
              <Link href="/admin/users">
                Kelola Pengguna
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="justify-between rounded-2xl border-[#dce7f3] text-[#125EA9] hover:bg-[#f4f9ff] hover:text-[#125EA9]"
            >
              <Link href="/admin/audit-logs">
                Log Audit
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}