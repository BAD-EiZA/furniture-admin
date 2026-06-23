"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Truck, XCircle } from "lucide-react";

type Props = {
  orderId: string;
  orderCode: string;
  status: string;
};

export default function OrderShippingButtons({
  orderId,
  orderCode,
  status,
}: Props) {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<"" | "ship" | "unship">("");

  async function handleShip() {
    if (!confirm(`Tandai pesanan ${orderCode} sebagai sudah dikirim?`)) return;

    try {
      setLoadingType("ship");

      const res = await fetch("/api/orders/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menandai pesanan sebagai dikirim");
        return;
      }

      alert(`Pesanan ${orderCode} berhasil ditandai dikirim`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menandai pengiriman");
    } finally {
      setLoadingType("");
    }
  }

  async function handleUnship() {
    if (!confirm(`Batalkan status pengiriman pesanan ${orderCode}?`)) return;

    try {
      setLoadingType("unship");

      const res = await fetch("/api/orders/unship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal membatalkan pengiriman");
        return;
      }

      alert(`Pengiriman pesanan ${orderCode} berhasil dibatalkan`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membatalkan pengiriman");
    } finally {
      setLoadingType("");
    }
  }

  const canShip = status === "CONFIRMED" || status === "INVOICE_SENT";
  const canUnship = status === "SHIPPED";

  if (!canShip && !canUnship) return null;

  return (
    <>
      {canShip ? (
        <button
          type="button"
          onClick={handleShip}
          disabled={loadingType !== ""}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
        >
          <Truck className="h-3.5 w-3.5" />
          {loadingType === "ship" ? "Memproses..." : "Kirim"}
        </button>
      ) : null}

      {canUnship ? (
        <button
          type="button"
          onClick={handleUnship}
          disabled={loadingType !== ""}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-60"
        >
          <XCircle className="h-3.5 w-3.5" />
          {loadingType === "unship" ? "Memproses..." : "Batal Kirim"}
        </button>
      ) : null}
    </>
  );
}
