import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  FileText,
  MessageCircle,
  Phone,
  Receipt,
  UserRound,
  XCircle,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { buildWhatsAppInvoiceMessage } from "@/lib/whatsapp";
import { buildWhatsAppOrderMessage } from "@/lib/whatsapp-order";

function getStatusUI(status: string) {
  switch (status) {
    case "CONFIRMED":
      return {
        icon: <CheckCircle2 className="h-5 w-5" />,
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        cardClass: "bg-emerald-50 border-emerald-200",
        title: "Pembayaran Terkonfirmasi",
        description:
          "Pembayaran Anda telah diverifikasi. Invoice sudah tersedia dan dapat dikirim manual oleh sales melalui WhatsApp.",
      };

    case "REJECTED":
      return {
        icon: <XCircle className="h-5 w-5" />,
        badgeClass: "bg-red-50 text-red-700 border-red-200",
        cardClass: "bg-red-50 border-red-200",
        title: "Pembayaran Ditolak",
        description:
          "Pembayaran belum dapat diterima. Silakan hubungi sales untuk klarifikasi atau instruksi lebih lanjut.",
      };

    case "INVOICE_SENT":
      return {
        icon: <CheckCircle2 className="h-5 w-5" />,
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        cardClass: "bg-blue-50 border-blue-200",
        title: "Invoice Sudah Dikirim",
        description:
          "Invoice telah ditandai sudah dikirim ke customer. Silakan cek WhatsApp atau hubungi sales jika diperlukan.",
      };

    case "WAITING_CONFIRMATION":
      return {
        icon: <Clock3 className="h-5 w-5" />,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        cardClass: "bg-amber-50 border-amber-200",
        title: "Menunggu Konfirmasi",
        description:
          "Bukti pembayaran sudah diterima sistem dan sedang menunggu verifikasi dari sales.",
      };

    case "PENDING_PAYMENT":
    default:
      return {
        icon: <Clock3 className="h-5 w-5" />,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        cardClass: "bg-slate-50 border-slate-200",
        title: "Pesanan Berhasil Dibuat",
        description:
          "Pesanan sudah masuk ke sistem. Silakan lanjutkan koordinasi dengan sales terkait proses pembayaran atau pengiriman.",
      };
  }
}

function formatPaymentMethod(method: string) {
  switch (method) {
    case "TRANSFER":
      return "Transfer Sebelum Pengiriman";
    case "COD":
      return "COD";
    case "TEMPO":
      return "Tempo";
    default:
      return method;
  }
}

function formatAdjustmentLabel(type: string) {
  switch (type) {
    case "DISCOUNT":
      return "Potongan";
    case "SURCHARGE":
      return "Tambahan";
    default:
      return "Penyesuaian";
  }
}

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const { orderCode } = await params;

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
          product: true,
        },
      },
      paymentProof: true,
      invoice: true,
    },
  });

  if (!order) notFound();

  const statusUI = getStatusUI(order.status);

  const invoicePdfUrl = order.invoice
    ? `${process.env.APP_URL}/api/orders/invoice/${order.orderCode}`
    : "";

  const whatsappInvoiceMessage =
    order.invoice && order.items.length > 0
      ? buildWhatsAppInvoiceMessage({
        customerName: order.customerNameDraft,
        invoiceNumber: order.invoice.invoiceNumber,
        orderCode: order.orderCode,
        productName:
          order.items.length === 1
            ? order.items[0].product.name
            : `${order.items.length} item produk`,
        quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        total: Number(order.total),
        invoicePdfUrl,
      })
      : "";

  const whatsappInvoiceHref =
    order.invoice && order.customerPhoneDraft
      ? `https://wa.me/${order.customerPhoneDraft.replace(/\D/g, "")}?text=${encodeURIComponent(
        whatsappInvoiceMessage
      )}`
      : "";

  const whatsappOrderMessage = buildWhatsAppOrderMessage({
    customerName: order.customerNameDraft,
    orderCode: order.orderCode,
    paymentMethod: formatPaymentMethod(order.paymentMethod),
    address: order.customerAddressDraft,
    total: Number(order.total),
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      readyQty: item.readyQty,
      poQty: item.poQty,
    })),
  });

  const whatsappOrderHref = order.sales.phone
    ? `https://wa.me/${order.sales.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      whatsappOrderMessage
    )}`
    : "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(18,94,169,0.12),_transparent_28%),linear-gradient(to_bottom,_#f8fbff,_#eef5ff)]">
      <section className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Beranda
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
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div
              className={`overflow-hidden rounded-[30px] border p-6 shadow-sm ${statusUI.cardClass}`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-white/80 p-3 text-current shadow-sm">
                  {statusUI.icon}
                </div>

                <div>
                  <div
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusUI.badgeClass}`}
                  >
                    {order.status}
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-slate-950">
                    {statusUI.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                    {statusUI.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">
                Ringkasan Order
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Customer
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {order.customerNameDraft}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.customerPhoneDraft}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Sales
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {order.sales.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.sales.phone || order.sales.email}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Metode Pembayaran
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {formatPaymentMethod(order.paymentMethod)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Invoice
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {order.invoice?.invoiceNumber || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Alamat Pengiriman</p>
                    <p className="mt-1 text-sm leading-7 text-slate-500">
                      {order.customerAddressDraft}
                    </p>
                  </div>
                </div>
              </div>

              {order.paymentNote ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-200 p-2 text-slate-700">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Catatan Pembayaran
                      </p>
                      <p className="mt-1 text-sm leading-7 text-slate-500">
                        {order.paymentNote}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">
                Detail Item Pesanan
              </h2>

              <div className="mt-5 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.product.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-slate-500">
                          Tier Harga: {item.priceTierLabel || "-"}
                        </p>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <div className="rounded-xl bg-white px-4 py-3 text-center">
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Ready
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {item.readyQty}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white px-4 py-3 text-center">
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            PO
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {item.poQty}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white px-4 py-3 text-center">
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Subtotal
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            Rp {Number(item.subtotal).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-slate-500">
                      Harga satuan: Rp{" "}
                      {Number(item.unitPrice).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#0e3d6c] via-[#125EA9] to-[#2E4FAE] p-5 text-white">
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      Rp {Number(order.subtotal).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>{formatAdjustmentLabel(order.adjustmentType)}</span>
                    <span>
                      {order.adjustmentType === "DISCOUNT" ? "-" : ""}
                      Rp{" "}
                      {Number(order.adjustmentValue).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-sm text-slate-300">Total Akhir</p>
                  <p className="mt-2 text-3xl font-bold">
                    Rp {Number(order.total).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-slate-950">
                Dokumen & Aksi
              </h2>

              <div className="mt-5 grid gap-3">
                {order.paymentProof ? (
                  <a
                    href={order.paymentProof.fileUrl}
                    target="_blank"
                    className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center">
                      <Receipt className="mr-2 h-4 w-4" />
                      Lihat Bukti Pembayaran
                    </span>
                    <span>↗</span>
                  </a>
                ) : null}

                {order.invoice ? (
                  <a
                    href={`/api/orders/invoice/${order.orderCode}`}
                    target="_blank"
                    className="inline-flex items-center justify-between rounded-2xl bg-[#125EA9] px-4 py-4 text-sm font-medium text-white shadow-lg shadow-[#125EA9]/20 hover:bg-[#0f4f8f]"
                  >
                    <span className="inline-flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Invoice PDF
                    </span>
                    <span>↗</span>
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
                      Konfirmasi Order ke Sales
                    </span>
                    <span>↗</span>
                  </a>
                ) : null}

                {order.invoice && whatsappInvoiceHref ? (
                  <a
                    href={whatsappInvoiceHref}
                    target="_blank"
                    className="inline-flex items-center justify-between rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
                  >
                    <span className="inline-flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Kirim Invoice via WhatsApp
                    </span>
                    <span>↗</span>
                  </a>
                ) : null}

                {order.sales.phone ? (
                  <a
                    href={`https://wa.me/${order.sales.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span className="inline-flex items-center">
                      <Phone className="mr-2 h-4 w-4" />
                      Hubungi Sales
                    </span>
                    <span>↗</span>
                  </a>
                ) : null}
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Kontak Sales</h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-200 p-2 text-slate-700">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {order.sales.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.sales.email}
                      </p>
                      {order.sales.phone ? (
                        <p className="mt-1 text-sm text-slate-500">
                          {order.sales.phone}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {whatsappOrderMessage ? (
              <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">
                  Template WhatsApp Order
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Gunakan ini untuk menghubungi sales setelah pesanan berhasil dibuat.
                </p>

                <textarea
                  readOnly
                  value={whatsappOrderMessage}
                  className="mt-5 min-h-[220px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700 outline-none"
                />
              </div>
            ) : null}

            {order.invoice && whatsappInvoiceMessage ? (
              <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">
                  Template WhatsApp Invoice
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Template ini digunakan sales untuk mengirim invoice setelah pembayaran dikonfirmasi.
                </p>

                <textarea
                  readOnly
                  value={whatsappInvoiceMessage}
                  className="mt-5 min-h-[220px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700 outline-none"
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}