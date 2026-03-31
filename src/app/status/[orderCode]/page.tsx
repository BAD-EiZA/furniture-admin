import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppInvoiceMessage } from "@/lib/whatsapp";
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

  const invoicePdfUrl = `${process.env.APP_URL}/api/orders/invoice/${order.orderCode}`;

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

  const whatsappHref = order.invoice
    ? `https://wa.me/${order.customerPhoneDraft.replace(/\D/g, "")}?text=${encodeURIComponent(
        whatsappMessage,
      )}`
    : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold">Status Pembayaran</h1>
        <p className="mt-2 text-sm text-slate-500">
          Order Code: {order.orderCode}
        </p>
        {order.invoice ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`/api/orders/invoice/${order.orderCode}`}
              target="_blank"
              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              Download PDF
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
            >
              Kirim via WhatsApp
            </a>
          </div>
        ) : null}
        {order.invoice ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`/api/orders/invoice/${order.orderCode}`}
              target="_blank"
              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              Download PDF
            </a>

            <a
              href={whatsappHref}
              target="_blank"
              className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
            >
              Kirim via WhatsApp
            </a>
          </div>
        ) : null}
        <div className="mt-6 space-y-3 text-sm">
          <p>
            <span className="font-medium">Nama:</span> {order.customerNameDraft}
          </p>
          <p>
            <span className="font-medium">No. HP:</span>{" "}
            {order.customerPhoneDraft}
          </p>
          <p>
            <span className="font-medium">Produk:</span> {item?.product.name}
          </p>
          <p>
            <span className="font-medium">Quantity:</span> {item?.quantity}
          </p>
          <p>
            <span className="font-medium">Total:</span> Rp{" "}
            {Number(order.total).toLocaleString("id-ID")}
          </p>
          <p>
            <span className="font-medium">Sales:</span> {order.sales.name}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                order.status === "CONFIRMED"
                  ? "bg-green-50 text-green-700"
                  : order.status === "REJECTED"
                    ? "bg-red-50 text-red-700"
                    : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {order.status}
            </span>
          </p>

          {order.invoice ? (
            <p>
              <span className="font-medium">Invoice:</span>{" "}
              {order.invoice.invoiceNumber}
            </p>
          ) : null}

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
        </div>

        {order.status === "WAITING_CONFIRMATION" ? (
          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            Bukti pembayaran sudah dikirim. Menunggu konfirmasi dari sales.
          </div>
        ) : null}

        {order.status === "CONFIRMED" ? (
          <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            Pembayaran telah dikonfirmasi. Invoice akan dikirim manual oleh
            sales melalui WhatsApp.
          </div>
        ) : null}

        {order.status === "REJECTED" ? (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Pembayaran ditolak. Silakan hubungi sales untuk klarifikasi.
          </div>
        ) : null}
      </div>
    </div>
  );
}
