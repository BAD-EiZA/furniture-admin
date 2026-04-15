import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSalesDashboardSummary } from "@/lib/sales-dashboard-cache";
import { buildSalesInvoiceWhatsappMessage } from "@/lib/whatsapp-invoice";
import OrderPreviewModal from "@/components/order-preview-modal";

function getStatusBadgeClass(status: string) {
  if (status === "CONFIRMED" || status === "INVOICE_SENT") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }

  if (status === "WAITING_CONFIRMATION" || status === "PENDING_PAYMENT") {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }

  if (status === "REJECTED" || status === "CANCELLED") {
    return "bg-red-50 text-red-700 border border-red-200";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function formatStatus(status: string) {
  if (status === "PENDING_PAYMENT") return "Menunggu Pembayaran";
  if (status === "WAITING_CONFIRMATION") return "Menunggu Konfirmasi";
  if (status === "CONFIRMED") return "Terkonfirmasi";
  if (status === "REJECTED") return "Ditolak";
  if (status === "CANCELLED") return "Dibatalkan";
  if (status === "INVOICE_SENT") return "Invoice Terkirim";
  return status;
}

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

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Order Terbaru</h3>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-500">
            Belum ada order untuk sales ini
          </div>
        ) : (
          <>
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {recentOrders.map((order) => {
                  const item = order.items[0];
                  const appUrl = process.env.APP_URL || "";
                  const invoicePdfUrl = `${appUrl}/api/orders/invoice/${order.orderCode}`;

                  const whatsappInvoiceMessage =
                    order.invoice && order.status === "CONFIRMED"
                      ? buildSalesInvoiceWhatsappMessage({
                          customerName: order.customerNameDraft,
                          orderCode: order.orderCode,
                          invoiceNumber: order.invoice.invoiceNumber,
                          total: Number(order.total),
                          invoicePdfUrl,
                        })
                      : "";

                  const whatsappInvoiceHref =
                    order.invoice && order.status === "CONFIRMED"
                      ? `https://wa.me/${order.customerPhoneDraft
                          .replace(/\D/g, "")
                          .replace(/^0/, "62")}?text=${encodeURIComponent(
                          whatsappInvoiceMessage,
                        )}`
                      : "";

                  const whatsappCustomerMessage = `Halo ${order.customerNameDraft},

Kami dari HIRONA HOMEWARE ingin menindaklanjuti pesanan Anda.

Order Code: ${order.orderCode}
Total: Rp ${Number(order.total).toLocaleString("id-ID")}

Terima kasih.`;

                  const whatsappCustomerHref = order.customerPhoneDraft
                    ? `https://wa.me/${order.customerPhoneDraft
                        .replace(/\D/g, "")
                        .replace(/^0/, "62")}?text=${encodeURIComponent(
                        whatsappCustomerMessage,
                      )}`
                    : "";

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {order.orderCode}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {order.customerNameDraft}
                          </p>
                          <p className="text-xs text-slate-400">
                            {order.customerPhoneDraft}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusBadgeClass(
                            order.status,
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="rounded-xl bg-white px-3 py-2">
                          <span className="font-medium text-slate-900">
                            Produk:
                          </span>{" "}
                          {item?.product.name || "-"} x {item?.quantity || 0}
                        </div>

                        <div className="rounded-xl bg-white px-3 py-2">
                          <span className="font-medium text-slate-900">
                            Total:
                          </span>{" "}
                          Rp {Number(order.total).toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <OrderPreviewModal
                          order={order as any}
                          triggerLabel="Lihat"
                          defaultTab="detail"
                          salesActions={{
                            enabled: true,
                            whatsappCustomerHref,
                            whatsappInvoiceHref,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
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
                    const appUrl = process.env.APP_URL || "";
                    const invoicePdfUrl = `${appUrl}/api/orders/invoice/${order.orderCode}`;

                    const whatsappInvoiceMessage =
                      order.invoice && order.status === "CONFIRMED"
                        ? buildSalesInvoiceWhatsappMessage({
                            customerName: order.customerNameDraft,
                            orderCode: order.orderCode,
                            invoiceNumber: order.invoice.invoiceNumber,
                            total: Number(order.total),
                            invoicePdfUrl,
                          })
                        : "";

                    const whatsappInvoiceHref =
                      order.invoice && order.status === "CONFIRMED"
                        ? `https://wa.me/${order.customerPhoneDraft
                            .replace(/\D/g, "")
                            .replace(/^0/, "62")}?text=${encodeURIComponent(
                            whatsappInvoiceMessage,
                          )}`
                        : "";

                    const whatsappCustomerMessage = `Halo ${order.customerNameDraft},

Kami dari HIRONA HOMEWARE ingin menindaklanjuti pesanan Anda.

Order Code: ${order.orderCode}
Total: Rp ${Number(order.total).toLocaleString("id-ID")}

Terima kasih.`;

                    const whatsappCustomerHref = order.customerPhoneDraft
                      ? `https://wa.me/${order.customerPhoneDraft
                          .replace(/\D/g, "")
                          .replace(/^0/, "62")}?text=${encodeURIComponent(
                          whatsappCustomerMessage,
                        )}`
                      : "";

                    return (
                      <tr key={order.id} className="border-t">
                        <td className="px-4 py-3">{order.orderCode}</td>

                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">
                              {order.customerNameDraft}
                            </p>
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

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusBadgeClass(
                              order.status,
                            )}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <OrderPreviewModal
                              order={order as any}
                              triggerLabel="Lihat"
                              defaultTab="detail"
                              salesActions={{
                                enabled: true,
                                whatsappCustomerHref,
                                whatsappInvoiceHref,
                              }}
                            />
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
          </>
        )}
      </div>
    </div>
  );
}

