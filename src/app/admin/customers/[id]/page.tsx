import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          sales: true,
          invoice: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Detail Customer</h1>
        <p className="text-sm text-slate-500">{customer.name}</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p>
          <span className="font-medium">Nama:</span> {customer.name}
        </p>
        <p>
          <span className="font-medium">No HP:</span> {customer.phone}
        </p>
        <p>
          <span className="font-medium">Total Order:</span>{" "}
          {customer.orders.length}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 text-lg font-semibold">Riwayat Order</h2>
        <div className="space-y-3">
          {customer.orders.map((order) => {
            const item = order.items[0];
            return (
              <div key={order.id} className="rounded-xl border p-4">
                <p className="font-medium">{order.orderCode}</p>
                <p className="text-sm text-slate-500">
                  {item?.product.name} x {item?.quantity}
                </p>
                <p className="text-sm text-slate-500">
                  Sales: {order.sales.name}
                </p>
                <p className="text-sm text-slate-500">Status: {order.status}</p>
              </div>
            );
          })}

          {customer.orders.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada order.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
