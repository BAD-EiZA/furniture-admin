import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function getStatusUI(status: string) {
  switch (status) {
    case "WAITING_CONFIRMATION":
      return {
        icon: <Clock3 className="h-5 w-5" />,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        cardClass: "bg-amber-50 border-amber-200",
        title: "Menunggu Konfirmasi Pembayaran",
        description:
          "Pembayaran Anda sedang menunggu verifikasi dari tim sales.",
      };

    case "CONFIRMED":
      return {
        icon: <CheckCircle2 className="h-5 w-5" />,
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        cardClass: "bg-emerald-50 border-emerald-200",
        title: "Pembayaran Terkonfirmasi",
        description:
          "Pembayaran telah dikonfirmasi dan pesanan sedang diproses.",
      };

    case "INVOICE_SENT":
      return {
        icon: <CheckCircle2 className="h-5 w-5" />,
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        cardClass: "bg-blue-50 border-blue-200",
        title: "Invoice Sudah Dikirim",
        description:
          "Invoice telah ditandai sudah dikirim. Silakan cek WhatsApp atau hubungi sales jika diperlukan.",
      };

    case "REJECTED":
      return {
        icon: <XCircle className="h-5 w-5" />,
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        cardClass: "bg-red-50 border-red-200",
        title: "Pembayaran Ditolak",
        description:
          "Pembayaran ditolak. Silakan hubungi tim sales untuk informasi lebih lanjut.",
      };

    case "PENDING_PAYMENT":
    default:
      return {
        icon: <Clock3 className="h-5 w-5" />,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        cardClass: "bg-slate-50 border-slate-200",
        title: "Menunggu Pembayaran",
        description:
          "Pesanan sudah dibuat. Silakan selesaikan pembayaran sesuai metode yang dipilih.",
      };
  }
}

function normalizeWhatsappNumber(phone?: string | null) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return digits;
}

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

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = await params;

  const session = await getSession().catch(() => null);
  const isSales = session?.role === "SALES";

  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: {
      sales: {
        select: {
          name: true,
          phone: true,
          email: true,
        },
      },
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

  if (!order) {
    notFound();
  }

  const statusUI = getStatusUI(order.status);

  const whatsappOrderMessage = `Halo ${order.sales.name}, saya ingin menanyakan pesanan berikut:

Order Code: ${order.orderCode}
Nama: ${order.customerNameDraft}
No HP: ${order.customerPhoneDraft}
Area Pengiriman: ${formatDeliveryAreaType(order.deliveryAreaType)}
Kota: ${order.customerCityDraft}
Metode Pembayaran: ${formatPaymentMethod(order.paymentMethod)}

Mohon bantuannya. Terima kasih.`;

  const whatsappOrderHref = order.sales.phone
    ? `https://wa.me/${normalizeWhatsappNumber(
        order.sales.phone,
      )}?text=${encodeURIComponent(whatsappOrderMessage)}`
    : "";

  const invoicePdfHref = order.invoice
    ? `/api/orders/invoice/${order.orderCode}`
    : "";

  const appUrl = process.env.APP_URL || "";
  const whatsappInvoiceMessage =
    order.invoice && order.customerPhoneDraft
      ? `Halo ${order.customerNameDraft},

Berikut invoice untuk pesanan Anda.

Order Code: ${order.orderCode}
Invoice: ${order.invoice.invoiceNumber}
Total: Rp ${Number(order.total).toLocaleString("id-ID")}

Silakan lihat invoice PDF melalui link berikut:
${appUrl}/api/orders/invoice/${order.orderCode}

Terima kasih.
HIRONA HOMEWARE`
      : "";

  const whatsappInvoiceHref =
    order.invoice && order.customerPhoneDraft
      ? `https://wa.me/${normalizeWhatsappNumber(
          order.customerPhoneDraft,
        )}?text=${encodeURIComponent(whatsappInvoiceMessage)}`
      : "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(18,94,169,0.12),_transparent_28%),linear-gradient(to_bottom,_#f8fbff,_#eef5ff)]">
      <section className="border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-slate-900">
              Katalog
            </Link>
            <span>/</span>
            <span className="text-slate-900">Status Order</span>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Status Pesanan
              </h1>
              <p className="mt-2 text-slate-500">
                Pantau status transaksi, item pesanan, dan dokumen order Anda.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isSales ? (
                <Link
                  href="/sales/dashboard"
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Dashboard Sales
                </Link>
              ) : null}

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Order Code
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {order.orderCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="space-y-6">
          <div
            className={`rounded-[28px] border p-6 shadow-sm ${statusUI.cardClass}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`rounded-2xl border px-3 py-3 ${statusUI.badgeClass}`}
              >
                {statusUI.icon}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {statusUI.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {statusUI.description}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusUI.badgeClass}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Informasi Customer
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Nama</p>
                <p className="mt-1 font-medium text-slate-900">
                  {order.customerNameDraft}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Nomor HP</p>
                <p className="mt-1 font-medium text-slate-900">
                  {order.customerPhoneDraft}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#eef4ff] p-2 text-[#125EA9]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Alamat Pengiriman
                  </p>
                  <p className="mt-1 text-sm leading-7 text-slate-500">
                    {order.customerAddressDraft}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Area:{" "}
                    <span className="font-medium text-slate-700">
                      {formatDeliveryAreaType(order.deliveryAreaType)}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">
                    Kecamatan:{" "}
                    <span className="font-medium text-slate-700">
                      {order.customerDistrictDraft}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">
                    Kota:{" "}
                    <span className="font-medium text-slate-700">
                      {order.customerCityDraft}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Sales</p>
                <p className="mt-1 font-medium text-slate-900">
                  {order.sales.name}
                </p>
                {order.sales.phone ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {order.sales.phone}
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Metode Pembayaran</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatPaymentMethod(order.paymentMethod)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Rincian Item
            </h2>

            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <div className="h-20 w-24 overflow-hidden rounded-xl bg-slate-100">
                        {item.product?.medias?.[0]?.type === "IMAGE" ? (
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
                        <div className="mt-3 space-y-1 text-sm text-slate-500">
                          <p>
                            Harga satuan final: Rp{" "}
                            {Number(item.unitPrice).toLocaleString("id-ID")}
                          </p>
                          <p>
                            Ongkir per item: Rp{" "}
                            {Number(
                              item.shippingCostPerItem || 0,
                            ).toLocaleString("id-ID")}
                          </p>
                          <p>
                            Diskon: {Number(item.discountPercent || 0) * 100}%
                          </p>
                          {item.priceTierLabel ? (
                            <p>Label harga: {item.priceTierLabel}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-500 md:text-right">
                      <p>
                        Quantity:{" "}
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

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
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
                <span>Ongkir</span>
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

            <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#0e3d6c] via-[#125EA9] to-[#2E4FAE] p-5 text-white">
              <p className="text-sm text-slate-100">Total Akhir</p>
              <p className="mt-2 text-3xl font-bold">
                Rp {Number(order.total).toLocaleString("id-ID")}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Aturan Pembayaran</p>
              <ul className="mt-3 space-y-2">
                <li>• Transfer / Bayar di Muka: Potongan 1%</li>
                <li>• COD: Harga Normal</li>
                <li>• Tempo: Penambahan 3%</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Dokumen & Aksi
            </h2>

            <div className="mt-5 grid gap-3">
              {invoicePdfHref ? (
                <a
                  href={invoicePdfHref}
                  target="_blank"
                  className="inline-flex items-center justify-between rounded-2xl bg-[#125EA9] px-4 py-4 text-sm font-medium text-white shadow-lg shadow-[#125EA9]/20 hover:bg-[#0f4f8f]"
                >
                  <span className="inline-flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Invoice PDF
                  </span>
                </a>
              ) : null}

              {order.paymentProof ? (
                <a
                  href={order.paymentProof.fileUrl}
                  target="_blank"
                  className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="inline-flex items-center">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Lihat Bukti Bayar
                  </span>
                </a>
              ) : null}

              {whatsappOrderHref ? (
                <a
                  href={whatsappOrderHref}
                  target="_blank"
                  className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="inline-flex items-center">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Hubungi Sales
                  </span>
                </a>
              ) : null}

              {whatsappInvoiceHref ? (
                <a
                  href={whatsappInvoiceHref}
                  target="_blank"
                  className="inline-flex items-center justify-between rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <span className="inline-flex items-center">
                    <Truck className="mr-2 h-4 w-4" />
                    Kirim Invoice via WhatsApp
                  </span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
