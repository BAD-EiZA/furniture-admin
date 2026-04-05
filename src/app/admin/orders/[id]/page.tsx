import { notFound } from "next/navigation";
import {
  MapPin,
  User,
  Phone,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

function formatPayment(method: string) {
  if (method === "TRANSFER") return "Transfer";
  if (method === "COD") return "COD";
  if (method === "TEMPO") return "Tempo";
  return method;
}

export default async function AdminOrderDetail({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      sales: true,
      items: {
        include: {
          product: true,
        },
      },
      paymentProof: true,
      invoice: true,
    },
  });

  if (!order) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* HEADER */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Detail Order
          </h1>
          <p className="text-sm text-slate-500">
            {order.orderCode}
          </p>
        </div>

        {/* CUSTOMER */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-900">
              Customer
            </h2>

            <div className="space-y-2 text-sm">
              <p><User className="inline mr-2 h-4 w-4" />{order.customerNameDraft}</p>
              <p><Phone className="inline mr-2 h-4 w-4" />{order.customerPhoneDraft}</p>
              <p><MapPin className="inline mr-2 h-4 w-4" />{order.customerAddressDraft}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-900">
              Sales & Payment
            </h2>

            <div className="space-y-2 text-sm">
              <p>{order.sales.name}</p>
              <p>{order.sales.phone}</p>
              <p>
                <CreditCard className="inline mr-2 h-4 w-4" />
                {formatPayment(order.paymentMethod)}
              </p>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Item Order
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm text-slate-500">
                      Tier: {item.priceTierLabel}
                    </p>
                  </div>

                  <div className="text-right text-sm">
                    <p>Harga: Rp {Number(item.unitPrice).toLocaleString("id-ID")}</p>
                    <p className="font-semibold">
                      Rp {Number(item.subtotal).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded bg-green-50 p-2 text-green-700">
                    Ready: {item.readyQty}
                  </div>
                  <div className="rounded bg-yellow-50 p-2 text-yellow-700">
                    PO: {item.poQty}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOTAL */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">
            Ringkasan Pembayaran
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {Number(order.subtotal).toLocaleString("id-ID")}</span>
            </div>

            <div className="flex justify-between">
              <span>Adjustment</span>
              <span>
                {order.adjustmentType === "DISCOUNT" ? "-" : ""}
                Rp {Number(order.adjustmentValue).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>Rp {Number(order.total).toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT PROOF */}
        {order.paymentProof && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 font-semibold">Bukti Pembayaran</h2>
            <a
              href={order.paymentProof.fileUrl}
              target="_blank"
              className="text-blue-600 underline"
            >
              Lihat Bukti
            </a>
          </div>
        )}

        {/* ACTION */}
        <div className="flex flex-wrap gap-4">
          {order.status !== "CONFIRMED" && order.status !== "INVOICE_SENT" ? (
            <>
              <form action={`/api/orders/confirm`} method="POST">
                <input type="hidden" name="orderId" value={order.id} />
                <button className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-white">
                  <CheckCircle className="h-4 w-4" />
                  Confirm
                </button>
              </form>

              <form action={`/api/orders/reject`} method="POST">
                <input type="hidden" name="orderId" value={order.id} />
                <button className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-white">
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </form>
            </>
          ) : null}

          {order.invoice && order.status === "CONFIRMED" ? (
            <form action={`/api/orders/invoice-sent`} method="POST">
              <input type="hidden" name="orderId" value={order.id} />
              <button className="rounded-xl bg-blue-600 px-5 py-3 text-white">
                Tandai Invoice Sent
              </button>
            </form>
          ) : null}

          {order.status === "INVOICE_SENT" ? (
            <div className="rounded-xl bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700">
              Invoice sudah ditandai terkirim
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}