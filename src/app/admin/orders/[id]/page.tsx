import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      sales: true,
      customer: true,
      paymentProof: true,
      invoice: true,
      items: {
        include: {
          product: true,
        },
      },
      timelines: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) notFound();

  const item = order.items[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Detail Order</h1>
          <p className="text-sm text-slate-500">{order.orderCode}</p>
        </div>

        <Link
          href="/admin/orders"
          className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Kembali
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold">Informasi Order</h2>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Customer:</span>{" "}
              {order.customerNameDraft}
            </p>
            <p>
              <span className="font-medium">No HP:</span>{" "}
              {order.customerPhoneDraft}
            </p>
            <p>
              <span className="font-medium">Sales:</span> {order.sales.name}
            </p>
            <p>
              <span className="font-medium">Status:</span> {order.status}
            </p>
            <p>
              <span className="font-medium">Total:</span> Rp{" "}
              {Number(order.total).toLocaleString("id-ID")}
            </p>
            <p>
              <span className="font-medium">Catatan pembayaran:</span>{" "}
              {order.paymentNote || "-"}
            </p>
            <p>
              <span className="font-medium">Catatan internal:</span>{" "}
              {order.internalNote || "-"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-semibold">Item</h2>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Produk:</span> {item?.product.name}
            </p>
            <p>
              <span className="font-medium">Quantity:</span> {item?.quantity}
            </p>
            <p>
              <span className="font-medium">Harga:</span> Rp{" "}
              {Number(item?.price || 0).toLocaleString("id-ID")}
            </p>
            <p>
              <span className="font-medium">Subtotal:</span> Rp{" "}
              {Number(item?.subtotal || 0).toLocaleString("id-ID")}
            </p>
            {order.paymentProof ? (
              <p>
                <a
                  href={order.paymentProof.fileUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Lihat bukti pembayaran
                </a>
              </p>
            ) : null}
            {order.invoice ? (
              <p>
                <a
                  href={`/api/orders/invoice/${order.orderCode}`}
                  target="_blank"
                  className="text-emerald-600 underline"
                >
                  Download invoice PDF
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 text-lg font-semibold">Timeline Order</h2>
        <div className="space-y-4">
          {order.timelines.map((timeline) => (
            <div key={timeline.id} className="rounded-xl border p-4">
              <p className="font-medium">{timeline.title}</p>
              <p className="text-sm text-slate-500">
                {timeline.description || "-"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {timeline.createdAt.toISOString()}
              </p>
            </div>
          ))}

          {order.timelines.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada timeline.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
