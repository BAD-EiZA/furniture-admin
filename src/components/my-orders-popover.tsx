"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Loader2 } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CHECKOUT_DRAFT_KEY = "hirona_checkout_draft_v1";

type OrderItem = {
  id: string;
  orderCode: string;
  status: string;
  total: number;
  createdAt: string;
};

function formatStatus(status: string) {
  if (status === "PENDING_PAYMENT") return "Menunggu Pembayaran";
  if (status === "WAITING_CONFIRMATION") return "Menunggu Konfirmasi";
  if (status === "CONFIRMED") return "Terkonfirmasi";
  if (status === "REJECTED") return "Ditolak";
  if (status === "CANCELLED") return "Dibatalkan";
  if (status === "INVOICE_SENT") return "Invoice Terkirim";
  return status;
}

function getStatusClasses(status: string) {
  if (status === "CONFIRMED" || status === "INVOICE_SENT") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }

  if (status === "PENDING_PAYMENT" || status === "WAITING_CONFIRMATION") {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }

  if (status === "REJECTED" || status === "CANCELLED") {
    return "bg-red-50 text-red-700 border border-red-200";
  }

  return "bg-[#eef4ff] text-[#125EA9] border border-[#dbe8f7]";
}

export default function MyOrdersPopover() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (!raw) return;

      const draft = JSON.parse(raw);
      setPhone(draft?.customerPhone || "");
    } catch (error) {
      console.error("FAILED_TO_READ_CHECKOUT_DRAFT", error);
    }
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      if (!open || !phone.trim()) return;

      try {
        setLoading(true);

        const res = await fetch(
          `/api/public/orders/by-phone?phone=${encodeURIComponent(phone.trim())}`,
          { cache: "no-store" },
        );
        const data = await res.json();

        if (!res.ok) {
          setOrders([]);
          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("FAILED_TO_FETCH_MY_ORDERS", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    

    fetchOrders();
  }, [open, phone]);

  const hasPhone = useMemo(() => phone.trim().length > 0, [phone]);
  const orderCount = orders.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur transition hover:bg-white/15 sm:px-4 sm:text-sm"
        >
          <ClipboardList className="h-4 w-4" />
          <span className="hidden sm:inline">Pesanan Saya</span>

          {hasPhone && orderCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#C89B3C] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-md">
              {orderCount}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[360px] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl"
      >
        <div className="border-b border-slate-100 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Pesanan Saya
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {hasPhone
                  ? `Nomor: ${phone}`
                  : "Nomor HP belum ditemukan dari data checkout"}
              </p>
            </div>

            {hasPhone && orderCount > 0 ? (
              <span className="inline-flex items-center rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-semibold text-[#125EA9]">
                {orderCount} pesanan
              </span>
            ) : null}
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-3">
          {!hasPhone ? (
            <div className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
              Belum ada nomor HP tersimpan. Silakan checkout sekali dulu agar
              pesanan bisa dikenali otomatis.
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat pesanan...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
              Belum ada pesanan ditemukan untuk nomor ini.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/status/${order.orderCode}`}
                  className="block rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {order.orderCode}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(
                        order.status,
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Rp {Number(order.total).toLocaleString("id-ID")}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {hasPhone ? (
          <div className="border-t border-slate-100 p-3">
            <Link
              href={`/my-orders?phone=${encodeURIComponent(phone.trim())}`}
              className="block rounded-xl bg-[#125EA9] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#0f4f8f]"
              onClick={() => setOpen(false)}
            >
              Lihat Semua Pesanan
            </Link>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
