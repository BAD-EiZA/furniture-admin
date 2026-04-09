import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CheckCircle,
  FileText,
  MapPin,
  Phone,
  User,
  XCircle,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

function formatPaymentMethod(method: string) {
  if (method === "TRANSFER") return "Transfer / Bayar di Muka";
  if (method === "COD") return "COD";
  if (method === "TEMPO") return "Tempo";
  return method;
}

function formatAdjustmentLabel(type: string) {
  if (type === "DISCOUNT") return "Potongan Pembayaran";
  if (type === "SURCHARGE") return "Biaya Tambahan";
  return "Penyesuaian";
}

function formatDeliveryAreaType(type: string) {
  if (type === "DALAM_KOTA") return "Dalam Kota";
  if (type === "LUAR_KOTA") return "Luar Kota";
  return type;
}

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
      items: {
        include: {
          product: {
            include: {
              medias: {
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
            },
          },
        },
      },
      paymentProof: true,
      invoice: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Detail Order</h1>
          <p className="mt-2 text-sm text-slate-500">
            Order Code: {order.orderCode}
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Kembali
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Informasi Customer
            </h2>

            <div className="mt-5 space-y-2 text-sm">
              <p>
                <User className="mr-2 inline h-4 w-4" />
                {order.customerNameDraft}
              </p>
              <p>
                <Phone className="mr-2 inline h-4 w-4" />
                {order.customerPhoneDraft}
              </p>
              <p>
                <MapPin className="mr-2 inline h-4 w-4" />
                {order.customerAddressDraft}
              </p>
              <p>
                Area Pengiriman:{" "}
                {formatDeliveryAreaType(order.deliveryAreaType)}
              </p>
              <p>Kecamatan: {order.customerDistrictDraft}</p>
              <p>Kota: {order.customerCityDraft}</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Sales</p>
                <p className="mt-1 font-medium text-slate-900">
                  {order.sales.name}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Metode Pembayaran</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatPaymentMethod(order.paymentMethod)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Transfer: potongan 1% • COD: normal • Tempo: +3%
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Item Order</h2>

            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="h-20 w-24 overflow-hidden rounded-xl bg-slate-100">
                        {item.product.medias[0]?.type === "IMAGE" ? (
                          <img
                            src={item.product.medias[0].fileUrl}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-500">
                            No image
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.product.name}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Harga satuan final: Rp{" "}
                          {Number(item.unitPrice).toLocaleString("id-ID")}
                        </p>
                        <p className="text-sm text-slate-500">
                          Diskon: {Number(item.discountPercent || 0) * 100}%
                        </p>
                        <p className="text-sm text-slate-500">
                          Ongkir/item: Rp{" "}
                          {Number(item.shippingCostPerItem || 0).toLocaleString(
                            "id-ID",
                          )}
                        </p>
                        {item.priceTierLabel ? (
                          <p className="text-sm text-slate-500">
                            Label harga: {item.priceTierLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-500 md:text-right">
                      <p>
                        Qty:{" "}
                        <span className="font-medium text-slate-900">
                          {item.quantity}
                        </span>
                      </p>
                      <p>
                        Ready:{" "}
                        <span className="font-medium text-emerald-700">
                          {item.readyQty}
                        </span>
                      </p>
                      <p>
                        PO:{" "}
                        <span className="font-medium text-amber-700">
                          {item.poQty}
                        </span>
                      </p>
                      <p>
                        Subtotal:{" "}
                        <span className="font-semibold text-slate-900">
                          Rp {Number(item.subtotal).toLocaleString("id-ID")}
                        </span>
                      </p>
                    </div>
                  </div>

                  {item.poQty > 0 ? (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      Sebagian item masuk kategori pre-order.
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Ringkasan Pembayaran
            </h2>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {Number(order.subtotal).toLocaleString("id-ID")}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  Rp {Number(order.shippingCost || 0).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between">
                <span>{formatAdjustmentLabel(order.adjustmentType)}</span>
                <span>
                  {Number(order.adjustmentValue) > 0 &&
                  order.adjustmentType === "DISCOUNT"
                    ? "-"
                    : ""}
                  Rp{" "}
                  {Math.abs(Number(order.adjustmentValue)).toLocaleString(
                    "id-ID",
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">Total Akhir</p>
              <p className="mt-2 text-3xl font-bold">
                Rp {Number(order.total).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Dokumen</h2>

            <div className="mt-5 grid gap-3">
              {order.paymentProof ? (
                <a
                  href={order.paymentProof.fileUrl}
                  target="_blank"
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Lihat Bukti Bayar
                </a>
              ) : null}

              {order.invoice ? (
                <a
                  href={`/api/orders/invoice/${order.orderCode}`}
                  target="_blank"
                  className="inline-flex items-center rounded-2xl bg-[#125EA9] px-4 py-3 text-sm font-medium text-white hover:bg-[#0f4f8f]"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Invoice PDF
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Aksi</h2>

            <div className="mt-5 flex flex-wrap gap-4">
              {order.status !== "CONFIRMED" &&
              order.status !== "INVOICE_SENT" ? (
                <>
                  <form action="/api/orders/confirm" method="POST">
                    <input type="hidden" name="orderId" value={order.id} />
                    <button className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-white">
                      <CheckCircle className="h-4 w-4" />
                      Confirm
                    </button>
                  </form>

                  <form action="/api/orders/reject" method="POST">
                    <input type="hidden" name="orderId" value={order.id} />
                    <button className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-white">
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </form>
                </>
              ) : null}

              {order.invoice && order.status === "CONFIRMED" ? (
                <form action="/api/orders/invoice-sent" method="POST">
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
      </div>
    </div>
  );
}
