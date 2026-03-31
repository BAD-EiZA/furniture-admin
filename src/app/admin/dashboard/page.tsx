import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [productCount, adminCount, salesCount, orderCount] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({
      where: {
        role: {
          in: ["SUPER_ADMIN", "ADMIN"],
        },
      },
    }),
    prisma.user.count({
      where: {
        role: "SALES",
      },
    }),
    prisma.order.count(),
  ]);

  const cards = [
    { title: "Total Produk", value: productCount },
    { title: "Total Admin", value: adminCount },
    { title: "Total Sales", value: salesCount },
    { title: "Total Order", value: orderCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Admin</h2>
        <p className="text-sm text-slate-500">
          Ringkasan data utama aplikasi furniture
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <p className="text-sm text-slate-500">{card.title}</p>
            <h3 className="mt-2 text-3xl font-bold">{card.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
