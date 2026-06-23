import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPageParams } from "@/lib/pagination";
import OrderPreviewModal from "@/components/order-preview-modal";
import OrderShippingButtons from "@/components/order-shipping-buttons";

function formatPaymentMethod(method: string) {
  if (method === "TRANSFER") return "Transfer";
  if (method === "COD") return "COD";
  if (method === "TEMPO") return "Tempo";
  return method;
}

function formatDate(value: Date) {
  return value.toLocaleString("id-ID");
}

function getStatusBadgeClass(status: string) {
  if (status === "SHIPPED") {
    return "bg-indigo-50 text-indigo-700 border border-indigo-200";
  }

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
  if (status === "SHIPPED") return "Dikirim";
  return status;
}


// Konversi semua field Decimal dan Date ke plain value agar bisa dikirim ke Client Component
function serializeOrder(order: any) {
  return {
    ...order,
    adjustmentValue: order.adjustmentValue.toString(),
    shippingCost: order.shippingCost.toString(),
    subtotal: order.subtotal.toString(),
    total: order.total.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    rejectedAt: order.rejectedAt?.toISOString() ?? null,
    invoiceSentAt: order.invoiceSentAt?.toISOString() ?? null,
    shippedAt: order.shippedAt ? order.shippedAt.toISOString() : null,
    items: order.items.map((item: any) => ({
      ...item,
      unitPrice: item.unitPrice.toString(),
      subtotal: item.subtotal.toString(),
      discountPercent: item.discountPercent.toString(),
      shippingCostPerItem: item.shippingCostPerItem.toString(),
	  
	  product: item.product ? {
        ...item.product,
        price: item.product.price.toString(),
        shippingFee: item.product.shippingFee ? item.product.shippingFee.toString() : "0",
      } : null,
	  
    })),
  };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
    status?: string;
    paymentMethod?: string;
    salesId?: string;
    hasPo?: string;
    dateFrom?: string;
    dateTo?: string;
    shippingStatus?: string;
  }>;
}) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const status = params.status?.trim() || "";
  const paymentMethod = params.paymentMethod?.trim() || "";
  const salesId = params.salesId?.trim() || "";
  const hasPo = params.hasPo?.trim() || "";
  const dateFrom = params.dateFrom?.trim() || "";
  const dateTo = params.dateTo?.trim() || "";
  const shippingStatus = params.shippingStatus?.trim() || "";

  const { page, limit, skip } = getPageParams(params);

  const where = {
    ...(q
      ? {
          OR: [
            { orderCode: { contains: q, mode: "insensitive" as const } },
            {
              customerNameDraft: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              customerPhoneDraft: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              customerAddressDraft: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(status ? { status: status as any } : {}),
    ...(paymentMethod ? { paymentMethod: paymentMethod as any } : {}),
    ...(salesId ? { salesId } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: new Date(`${dateFrom}T00:00:00.000Z`) } : {}),
            ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
    ...(hasPo === "true"
      ? {
          items: {
            some: {
              poQty: {
                gt: 0,
              },
            },
          },
        }
      : {}),
    ...(shippingStatus === "shipped"
      ? { status: "SHIPPED" as const }
      : shippingStatus === "not_shipped"
        ? {
            status: {
              in: ["CONFIRMED", "INVOICE_SENT"] as const,
            },
          }
        : {}),
  };

  const [orders, total, salesList] = await Promise.all([
    prisma.order.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
        invoice: true,
        paymentProof: true,
      },
    }),
    prisma.order.count({ where: where as any }),
    prisma.user.findMany({
      where: {
        role: "SALES",
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const queryBase = new URLSearchParams({
    q,
    status,
    paymentMethod,
    salesId,
    hasPo,
    dateFrom,
    dateTo,
    shippingStatus,
    limit: String(limit),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pesanan</h2>
          <p className="text-sm text-slate-500">
            Pantau pembayaran, status, metode pembayaran, dan item PO
          </p>
        </div>

        <a
          href={`/api/admin/orders/export?${queryBase.toString()}`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 sm:w-auto"
        >
          Ekspor Excel
        </a>
      </div>

      <form className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari pesanan, nama, HP, alamat..."
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 sm:col-span-2 xl:col-span-2"
          />

          <select
            name="status"
            defaultValue={status}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="PENDING_PAYMENT">Menunggu Pembayaran</option>
            <option value="WAITING_CONFIRMATION">Menunggu Konfirmasi</option>
            <option value="CONFIRMED">Terkonfirmasi</option>
            <option value="REJECTED">Ditolak</option>
            <option value="CANCELLED">Dibatalkan</option>
            <option value="INVOICE_SENT">Faktur Terkirim</option>
            <option value="SHIPPED">Dikirim</option>
          </select>

          <select
            name="paymentMethod"
            defaultValue={paymentMethod}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Semua Metode Pembayaran</option>
            <option value="TRANSFER">Transfer</option>
            <option value="COD">COD</option>
            <option value="TEMPO">Tempo</option>
          </select>

          <select
            name="salesId"
            defaultValue={salesId}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Semua Sales</option>
            {salesList.map((sales) => (
              <option key={sales.id} value={sales.id}>
                {sales.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="dateFrom"
            defaultValue={dateFrom}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="date"
            name="dateTo"
            defaultValue={dateTo}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            name="hasPo"
            defaultValue={hasPo}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Semua Pesanan</option>
            <option value="true">Hanya yang ada PO</option>
          </select>

          <select
            name="shippingStatus"
            defaultValue={shippingStatus}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Semua Status Pengiriman</option>
            <option value="shipped">Sudah Dikirim</option>
            <option value="not_shipped">Belum Dikirim</option>
          </select>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Filter
          </button>
        </div>
      </form>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {orders.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-500">
            Belum ada pesanan
          </div>
        ) : (
          <>
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {orders.map((order) => {
                  const totalQty = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  );
                  const totalPo = order.items.reduce(
                    (sum, item) => sum + item.poQty,
                    0,
                  );

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
                            {formatDate(order.createdAt)}
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
                            Pelanggan:
                          </span>{" "}
                          {order.customerNameDraft}
                          <div className="mt-1 text-xs text-slate-500">
                            {order.customerPhoneDraft}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {order.customerAddressDraft}
                          </div>
                        </div>

                        <div className="rounded-xl bg-white px-3 py-2">
                          <span className="font-medium text-slate-900">
                            Sales:
                          </span>{" "}
                          {order.sales?.name || "-"}
                        </div>

                        <div className="rounded-xl bg-white px-3 py-2">
                          <span className="font-medium text-slate-900">
                            Pembayaran:
                          </span>{" "}
                          {formatPaymentMethod(order.paymentMethod)}
                          <div className="mt-1 text-xs text-slate-500">
                            {order.adjustmentType} • Rp{" "}
                            {Number(order.adjustmentValue).toLocaleString(
                              "id-ID",
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl bg-white px-3 py-2">
                          <span className="font-medium text-slate-900">
                            Item:
                          </span>{" "}
                          {order.items.length} item • Jml {totalQty}
                          {totalPo > 0 ? (
                            <div className="mt-2">
                              <span className="inline-flex rounded-full bg-yellow-50 px-2 py-1 text-[11px] font-medium text-yellow-700">
                                PO {totalPo}
                              </span>
                            </div>
                          ) : null}
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
                          order={serializeOrder(order)}
                          triggerLabel="Detail"
                          defaultTab="detail"
                        />

                        <OrderPreviewModal
                          order={serializeOrder(order)}
                          triggerLabel="Status"
                          defaultTab="status"
                        />

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

                        <OrderShippingButtons
                          orderId={order.id}
                          orderCode={order.orderCode}
                          status={order.status}
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
                    <th className="px-4 py-3">Pesanan</th>
                    <th className="px-4 py-3">Pelanggan</th>
                    <th className="px-4 py-3">Sales</th>
                    <th className="px-4 py-3">Pembayaran</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const totalQty = order.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0,
                    );
                    const totalPo = order.items.reduce(
                      (sum, item) => sum + item.poQty,
                      0,
                    );

                    return (
                      <tr key={order.id} className="border-t">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{order.orderCode}</p>
                            <p className="text-xs text-slate-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">
                              {order.customerNameDraft}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.customerPhoneDraft}
                            </p>
                            <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                              {order.customerAddressDraft}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {order.sales?.name || "-"}
                        </td>

                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">
                              {formatPaymentMethod(order.paymentMethod)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.adjustmentType} • Rp{" "}
                              {Number(order.adjustmentValue).toLocaleString(
                                "id-ID",
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div>
                            <p>{order.items.length} item</p>
                            <p className="text-xs text-slate-500">
                              Jml {totalQty}
                            </p>
                            {totalPo > 0 ? (
                              <p className="mt-1 inline-flex rounded-full bg-yellow-50 px-2 py-1 text-[11px] font-medium text-yellow-700">
                                PO {totalPo}
                              </p>
                            ) : null}
                          </div>
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
                              order={serializeOrder(order)}
                              triggerLabel="Detail"
                              defaultTab="detail"
                            />

                            <OrderPreviewModal
                              order={serializeOrder(order)}
                              triggerLabel="Status"
                              defaultTab="status"
                            />

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

                            <OrderShippingButtons
                              orderId={order.id}
                              orderCode={order.orderCode}
                              status={order.status}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        Belum ada pesanan
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-500">
          Halaman {page} dari {totalPages} • Total {total} pesanan
        </p>

        <div className="flex gap-2">
          <Link
            href={`/admin/orders?${new URLSearchParams({
              ...Object.fromEntries(queryBase.entries()),
              page: String(Math.max(1, page - 1)),
            }).toString()}`}
            className={`flex-1 rounded-lg px-3 py-2 text-center sm:flex-none ${
              page <= 1
                ? "pointer-events-none bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Sebelumnya
          </Link>

          <Link
            href={`/admin/orders?${new URLSearchParams({
              ...Object.fromEntries(queryBase.entries()),
              page: String(Math.min(totalPages, page + 1)),
            }).toString()}`}
            className={`flex-1 rounded-lg px-3 py-2 text-center sm:flex-none ${
              page >= totalPages
                ? "pointer-events-none bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Selanjutnya
          </Link>
        </div>
      </div>
    </div>
  );
}
