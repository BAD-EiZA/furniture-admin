"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SalesOrderActionButtons from "@/components/sales-order-action-buttons";

type OrderPreviewItem = {
  id: string;
  quantity: number;
  readyQty: number;
  poQty: number;
  unitPrice: number | string;
  subtotal: number | string;
  discountPercent?: number | string | null;
  shippingCostPerItem?: number | string | null;
  priceTierLabel?: string | null;
  product: {
    name: string;
    medias?: {
      fileUrl: string;
      type: "IMAGE" | "VIDEO";
    }[];
  };
};

type OrderPreviewData = {
  id: string;
  orderCode: string;
  createdAt: string | Date;
  status: string;
  customerNameDraft: string;
  customerPhoneDraft: string;
  customerAddressDraft: string;
  customerDistrictDraft?: string | null;
  customerCityDraft?: string | null;
  deliveryAreaType?: string | null;
  paymentMethod: string;
  adjustmentType: string;
  adjustmentValue: number | string;
  subtotal: number | string;
  shippingCost?: number | string | null;
  total: number | string;
  sales: {
    name: string;
  };
  paymentProof?: {
    fileUrl: string;
  } | null;
  invoice?: {
    invoiceNumber?: string | null;
  } | null;
  items: OrderPreviewItem[];
};

function formatCurrency(value: number | string | null | undefined) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatPaymentMethod(method: string) {
  if (method === "TRANSFER") return "Transfer";
  if (method === "COD") return "COD";
  if (method === "TEMPO") return "Tempo";
  return method;
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

function getStatusClass(status: string) {
  if (status === "CONFIRMED" || status === "INVOICE_SENT") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }

  if (status === "PENDING_PAYMENT" || status === "WAITING_CONFIRMATION") {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }

  if (status === "REJECTED" || status === "CANCELLED") {
    return "bg-red-50 text-red-700 border border-red-200";
  }

  return "bg-slate-100 text-slate-700 border border-slate-200";
}

type SalesActionsProps = {
  enabled: boolean;
  whatsappCustomerHref?: string;
  whatsappInvoiceHref?: string;
};

export default function OrderPreviewModal({
  order,
  triggerLabel = "Lihat",
  defaultTab = "detail",
  salesActions,
}: {
  order: OrderPreviewData;
  triggerLabel?: "Lihat" | "Detail" | "Status";
  defaultTab?: "detail" | "status";
  salesActions?: SalesActionsProps;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"detail" | "status">(defaultTab);

  const totalQty = useMemo(
    () =>
      order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [order.items],
  );

  const totalPo = useMemo(
    () => order.items.reduce((sum, item) => sum + Number(item.poQty || 0), 0),
    [order.items],
  );

  function handleActionFinished() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTab(defaultTab);
          setOpen(true);
        }}
        className="rounded-lg bg-[#eef4ff] px-3 py-2 text-xs font-medium text-[#125EA9] hover:bg-[#dbe8f7]"
      >
        {triggerLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl border-slate-200 p-0 sm:max-w-5xl">
          <div className="flex h-full max-h-[90vh] flex-col">
            <DialogHeader className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <DialogTitle className="text-left text-xl font-bold text-slate-950">
                    {order.orderCode}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    order.status,
                  )}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTab("detail")}
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${
                    tab === "detail"
                      ? "bg-[#125EA9] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Detail
                </button>

                <button
                  type="button"
                  onClick={() => setTab("status")}
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${
                    tab === "status"
                      ? "bg-[#125EA9] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Status
                </button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {tab === "detail" ? (
                <div className="space-y-6">
                  {salesActions?.enabled ? (
                    <div className="rounded-2xl border border-[#dbe8f7] bg-[#f7fbff] p-4">
                      <h3 className="text-base font-semibold text-slate-900">
                        Aksi Sales
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <SalesOrderActionButtons
                          orderId={order.id}
                          orderCode={order.orderCode}
                          status={order.status}
                          hasInvoice={Boolean(order.invoice)}
                          onActionFinished={handleActionFinished}
                        />

                        {salesActions.whatsappCustomerHref ? (
                          <a
                            href={salesActions.whatsappCustomerHref}
                            target="_blank"
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Hubungi Customer via WhatsApp
                          </a>
                        ) : null}

                        {salesActions.whatsappInvoiceHref ? (
                          <a
                            href={salesActions.whatsappInvoiceHref}
                            target="_blank"
                            className="rounded-lg bg-[#125EA9] px-3 py-2 text-xs font-medium text-white hover:bg-[#0f4f8f]"
                          >
                            Kirim Invoice via WhatsApp
                          </a>
                        ) : null}

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
                            className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"
                          >
                            Invoice PDF
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                      <h3 className="font-semibold text-slate-900">
                        Data Pelanggan
                      </h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-medium text-slate-900">
                            Nama:
                          </span>{" "}
                          {order.customerNameDraft}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            No HP:
                          </span>{" "}
                          {order.customerPhoneDraft}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            Alamat:
                          </span>{" "}
                          {order.customerAddressDraft}
                        </p>
                        {order.customerDistrictDraft ? (
                          <p>
                            <span className="font-medium text-slate-900">
                              Kecamatan:
                            </span>{" "}
                            {order.customerDistrictDraft}
                          </p>
                        ) : null}
                        {order.customerCityDraft ? (
                          <p>
                            <span className="font-medium text-slate-900">
                              Kota:
                            </span>{" "}
                            {order.customerCityDraft}
                          </p>
                        ) : null}
                        {order.deliveryAreaType ? (
                          <p>
                            <span className="font-medium text-slate-900">
                              Area:
                            </span>{" "}
                            {order.deliveryAreaType}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                      <h3 className="font-semibold text-slate-900">
                        Ringkasan Pembayaran
                      </h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-medium text-slate-900">
                            Sales:
                          </span>{" "}
                          {order.sales.name}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            Metode:
                          </span>{" "}
                          {formatPaymentMethod(order.paymentMethod)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            Penyesuaian:
                          </span>{" "}
                          {order.adjustmentType} •{" "}
                          {formatCurrency(order.adjustmentValue)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            Subtotal:
                          </span>{" "}
                          {formatCurrency(order.subtotal)}
                        </p>
                        <p>
                          <span className="font-medium text-slate-900">
                            Ongkir:
                          </span>{" "}
                          {formatCurrency(order.shippingCost)}
                        </p>
                        <p className="text-base font-semibold text-slate-950">
                          Total: {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-slate-900">
                      Item Pesanan
                    </h3>

                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex gap-4">
                              <div className="h-20 w-24 overflow-hidden rounded-xl bg-slate-100">
                                {item.product.medias?.[0]?.type === "IMAGE" ? (
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
                                  Harga satuan: {formatCurrency(item.unitPrice)}
                                </p>
                                <p className="text-sm text-slate-500">
                                  Diskon:{" "}
                                  {Number(item.discountPercent || 0) * 100}%
                                </p>
                                <p className="text-sm text-slate-500">
                                  Ongkir/item:{" "}
                                  {formatCurrency(
                                    item.shippingCostPerItem || 0,
                                  )}
                                </p>
                                {item.priceTierLabel ? (
                                  <p className="text-sm text-slate-500">
                                    Label harga: {item.priceTierLabel}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600 md:text-right">
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
                              <p className="font-semibold text-slate-900">
                                {formatCurrency(item.subtotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {salesActions?.enabled ? (
                    <div className="rounded-2xl border border-[#dbe8f7] bg-[#f7fbff] p-4">
                      <h3 className="text-base font-semibold text-slate-900">
                        Aksi Sales
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <SalesOrderActionButtons
                          orderId={order.id}
                          orderCode={order.orderCode}
                          status={order.status}
                          hasInvoice={Boolean(order.invoice)}
                          onActionFinished={handleActionFinished}
                        />

                        {salesActions.whatsappCustomerHref ? (
                          <a
                            href={salesActions.whatsappCustomerHref}
                            target="_blank"
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Hubungi Customer via WhatsApp
                          </a>
                        ) : null}

                        {salesActions.whatsappInvoiceHref ? (
                          <a
                            href={salesActions.whatsappInvoiceHref}
                            target="_blank"
                            className="rounded-lg bg-[#125EA9] px-3 py-2 text-xs font-medium text-white hover:bg-[#0f4f8f]"
                          >
                            Kirim Invoice via WhatsApp
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Status</p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {formatStatus(order.status)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Jumlah Item</p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {order.items.length} item
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Jumlah Qty</p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {totalQty}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Item PO</p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {totalPo}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Ringkasan Status Pesanan
                    </h3>

                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        Order dibuat pada{" "}
                        <span className="font-medium text-slate-900">
                          {new Date(order.createdAt).toLocaleString("id-ID")}
                        </span>
                        .
                      </div>

                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        Status saat ini:{" "}
                        <span className="font-semibold text-slate-900">
                          {formatStatus(order.status)}
                        </span>
                        .
                      </div>

                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        Metode pembayaran:{" "}
                        <span className="font-medium text-slate-900">
                          {formatPaymentMethod(order.paymentMethod)}
                        </span>
                        .
                      </div>

                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        Total pembayaran:{" "}
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(order.total)}
                        </span>
                        .
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {order.paymentProof ? (
                        <a
                          href={order.paymentProof.fileUrl}
                          target="_blank"
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                          Lihat Bukti Bayar
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

