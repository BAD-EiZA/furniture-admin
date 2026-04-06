import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSalesDashboardSummary } from "@/lib/sales-dashboard-cache";

export default async function SalesDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "SALES") {
    redirect("/login");
  }

  const dashboard = await getSalesDashboardSummary(session.userId);

  const totalOrders = dashboard.totalOrders;
  const waitingOrders = dashboard.waitingOrders;
  const confirmedOrders = dashboard.confirmedOrders;
  const invoiceSentOrders = dashboard.invoiceSentOrders;
  const recentOrders = dashboard.recentOrders;

  const cards = [
    { title: "Total Order", value: totalOrders },
    { title: "Menunggu Konfirmasi", value: waitingOrders },
    { title: "Sudah Confirmed", value: confirmedOrders },
    { title: "Invoice Sent", value: invoiceSentOrders },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Sales</h2>
        <p className="text-sm text-slate-500">
          Pantau order yang menjadi tanggung jawab Anda
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

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Order Terbaru</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const item = order.items[0];
                return (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3">{order.orderCode}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.customerNameDraft}</p>
                        <p className="text-xs text-slate-500">
                          {order.customerPhoneDraft}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item?.product.name} x {item?.quantity}
                    </td>
                    <td className="px-4 py-3">
                      Rp {Number(order.total).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">{order.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/status/${order.orderCode}`}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Detail
                        </Link>

                        {order.paymentProof ? (
                          <a
                            href={order.paymentProof.fileUrl}
                            target="_blank"
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          >
                            Bukti Bayar
                          </a>
                        ) : null}

                        {order.invoice && order.status === "CONFIRMED" ? (
                          <form action="/api/orders/invoice-sent" method="POST">
                            <input
                              type="hidden"
                              name="orderId"
                              value={order.id}
                            />
                            <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700">
                              Invoice Sent
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Belum ada order untuk sales ini
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
