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

export default async function AdminDashboardPage() {
  const [productCount, adminCount, salesCount, orderCount, recentOrders] =
    await Promise.all([
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
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          sales: true,
          items: {
            include: { product: true },
          },
        },
      }),
    ]);

  const statCards = [
    {
      title: "Total Produk",
      value: productCount,
      icon: Package,
      hint: "Barang aktif di katalog",
    },
    {
      title: "Total Order",
      value: orderCount,
      icon: ShoppingCart,
      hint: "Semua transaksi masuk",
    },
    {
      title: "Admin",
      value: adminCount,
      icon: Users,
      hint: "Admin & super admin",
    },
    {
      title: "Sales",
      value: salesCount,
      icon: Wallet,
      hint: "Sales aktif",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-2xl lg:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge className="mb-4 rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/10">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
             Admin Dashboard
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Kelola produk, transaksi, dan tim 
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
            >
              <Link href="/admin/products/new">Tambah Produk</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="rounded-2xl bg-white/10 text-white hover:bg-white/15"
            >
              <Link href="/admin/orders">
                Lihat Order
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
              className="overflow-hidden rounded-[24px] border-slate-200/70 bg-white/80 shadow-lg backdrop-blur"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardDescription>{card.title}</CardDescription>
                  <CardTitle className="mt-2 text-3xl font-bold">
                    {card.value}
                  </CardTitle>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-100 text-slate-700">
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

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="rounded-[24px] border-slate-200/70 bg-white/85 shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle>Order Terbaru</CardTitle>
            <CardDescription>
              5 transaksi paling baru yang masuk ke sistem
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
                Belum ada order terbaru
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
                      <p className="font-semibold">{order.orderCode}</p>
                      <p className="text-sm text-slate-500">
                        {order.customerNameDraft} • {item?.product.name} x{" "}
                        {item?.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="rounded-full px-3 py-1"
                      >
                        {order.status}
                      </Badge>
                      <Button asChild variant="outline" className="rounded-xl">
                        <Link href={`/status/${order.orderCode}`}>Detail</Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-slate-200/70 bg-white/85 shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Aksi cepat untuk operasional harian
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3">
            <Button asChild className="justify-between rounded-2xl">
              <Link href="/admin/products/new">
                Tambah Produk
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="justify-between rounded-2xl"
            >
              <Link href="/admin/orders">
                Kelola Order
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="justify-between rounded-2xl"
            >
              <Link href="/admin/users">
                Kelola User
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="justify-between rounded-2xl"
            >
              <Link href="/admin/audit-logs">
                Audit Log
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
