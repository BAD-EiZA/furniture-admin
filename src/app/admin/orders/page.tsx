import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPageParams } from "@/lib/pagination";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const { page, limit, skip } = getPageParams(params);
  const status = params.status?.trim() || "";
  const where = {
    ...(q
      ? {
          OR: [
            { orderCode: { contains: q, mode: "insensitive" as const } },
            {
              customerNameDraft: { contains: q, mode: "insensitive" as const },
            },
            {
              customerPhoneDraft: { contains: q, mode: "insensitive" as const },
            },
          ],
        }
      : {}),
    ...(status
      ? {
          status: status as
            | "PENDING_PAYMENT"
            | "WAITING_CONFIRMATION"
            | "CONFIRMED"
            | "REJECTED"
            | "CANCELLED",
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        sales: true,
        items: {
          include: { product: true },
        },
        invoice: true,
        paymentProof: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Order</h2>
        <p className="text-sm text-slate-500">
          Monitoring pembayaran dan status konfirmasi
        </p>
      </div>

      <form className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_120px]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari order code, nama, nomor HP..."
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="WAITING_CONFIRMATION">WAITING_CONFIRMATION</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Filter
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Order</h2>
          <p className="text-sm text-slate-500">
            Monitoring pembayaran dan status konfirmasi
          </p>
        </div>

        <a
          href={`/api/admin/orders/export?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Export Excel
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Sales</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
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
                    <td className="px-4 py-3">{order.sales.name}</td>
                    <td className="px-4 py-3">
                      Rp {Number(order.total).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">{order.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Detail
                        </Link>
                        <Link
                          href={`/status/${order.orderCode}`}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Lihat Status
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
                        {order.invoice ? (
                          <a
                            href={`/api/orders/invoice/${order.orderCode}`}
                            target="_blank"
                            className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                          >
                            Invoice PDF
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Belum ada order
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-500">
          Halaman {page} dari {totalPages} • Total {total} order
        </p>

        <div className="flex gap-2">
          <Link
            href={`/admin/orders?q=${encodeURIComponent(q)}&status=${encodeURIComponent(
              status,
            )}&page=${Math.max(1, page - 1)}&limit=${limit}`}
            className={`rounded-lg px-3 py-2 ${
              page <= 1
                ? "pointer-events-none bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Prev
          </Link>

          <Link
            href={`/admin/orders?q=${encodeURIComponent(q)}&status=${encodeURIComponent(
              status,
            )}&page=${Math.min(totalPages, page + 1)}&limit=${limit}`}
            className={`rounded-lg px-3 py-2 ${
              page >= totalPages
                ? "pointer-events-none bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
