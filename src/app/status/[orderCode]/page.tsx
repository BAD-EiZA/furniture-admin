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
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { buildWhatsAppInvoiceMessage } from "@/lib/whatsapp";

function getStatusUI(status: string) {
  switch (status) {
    case "CONFIRMED":
      return {
        icon: <CheckCircle2 className="h-5 w-5" />,
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        cardClass: "bg-emerald-50 border-emerald-200",
        title: "Pembayaran Terkonfirmasi",
        description:
          "Pembayaran Anda telah diverifikasi. Invoice akan dikirim manual oleh sales melalui WhatsApp.",
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

    case "WAITING_CONFIRMATION":
    default:
      return {
        icon: <Clock3 className="h-5 w-5" />,
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        cardClass: "bg-amber-50 border-amber-200",
        title: "Menunggu Konfirmasi",
        description:
          "Bukti pembayaran sudah diterima sistem dan sedang menunggu verifikasi dari sales.",
      };
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

  const item = order.items[0];
  const statusUI = getStatusUI(order.status);

  const invoicePdfUrl = order.invoice
    ? `${process.env.APP_URL}/api/orders/invoice/${order.orderCode}`
    : "";

  const whatsappMessage =
    order.invoice && item
      ? buildWhatsAppInvoiceMessage({
          customerName: order.customerNameDraft,
          invoiceNumber: order.invoice.invoiceNumber,
          orderCode: order.orderCode,
          productName: item.product.name,
          quantity: item.quantity,
          total: Number(order.total),
          invoicePdfUrl,
        })
      : "";

  const whatsappHref =
    order.invoice && order.customerPhoneDraft
      ? `https://wa.me/${order.customerPhoneDraft.replace(/\D/g, "")}?text=${encodeURIComponent(
          whatsappMessage,
        )}`
      : "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)]">
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
                Status Pembayaran
              </h1>
              <p className="mt-2 text-slate-500">
                Pantau status transaksi dan dokumen order Anda dengan lebih
                mudah.
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
                    Total
                  </p>
                  <p className="mt-2 text-xl font-bold text-blue-700">
                    Rp {Number(order.total).toLocaleString("id-ID")}
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
            </div>

            <div className="rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">
                Detail Produk
              </h2>

              <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item?.product.name || "-"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Quantity: {item?.quantity || 0}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">Harga Satuan</p>
                    <p className="font-semibold text-slate-900">
                      Rp {Number(item?.price || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              {order.paymentNote ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    Catatan Pembayaran
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {order.paymentNote}
                  </p>
                </div>
              ) : null}
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
                    className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
                    className="inline-flex items-center justify-between rounded-2xl bg-blue-600 px-4 py-4 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
                  >
                    <span className="inline-flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Invoice PDF
                    </span>
                    <span>↗</span>
                  </a>
                ) : null}

                {order.invoice && whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    className="inline-flex items-center justify-between rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700"
                  >
                    <span className="inline-flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Kirim via WhatsApp
                    </span>
                    <span>↗</span>
                  </a>
                ) : null}

                {order.sales.phone ? (
                  <a
                    href={`https://wa.me/${order.sales.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
              <h2 className="text-xl font-semibold text-slate-950">Kontak</h2>

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

            {order.invoice && whatsappMessage ? (
              <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">
                  Template WhatsApp
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Template ini bisa digunakan sales untuk mengirim invoice
                  secara manual.
                </p>

                <textarea
                  readOnly
                  value={whatsappMessage}
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
