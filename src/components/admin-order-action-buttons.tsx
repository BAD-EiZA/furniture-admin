"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

type Props = {
  orderId: string;
  orderCode: string;
  status: string;
  hasInvoice: boolean;
};

export default function AdminOrderActionButtons({
  orderId,
  orderCode,
  status,
  hasInvoice,
}: Props) {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<
    "" | "confirm" | "reject" | "invoice"
  >("");

  async function handleConfirm() {
    try {
      setLoadingType("confirm");

      const res = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengonfirmasi order");
        return;
      }

      alert(`Order ${orderCode} berhasil dikonfirmasi`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengonfirmasi order");
    } finally {
      setLoadingType("");
    }
  }

  async function handleReject() {
    try {
      setLoadingType("reject");

      const reason = window.prompt("Masukkan alasan reject (opsional):") || "";

      const res = await fetch("/api/orders/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menolak order");
        return;
      }

      alert(`Order ${orderCode} berhasil ditolak`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menolak order");
    } finally {
      setLoadingType("");
    }
  }

  async function handleInvoiceSent() {
    try {
      setLoadingType("invoice");

      const res = await fetch("/api/orders/invoice-sent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menandai invoice sent");
        return;
      }

      alert(`Invoice untuk ${orderCode} ditandai terkirim`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menandai invoice sent");
    } finally {
      setLoadingType("");
    }
  }

  return (
    <div className="mt-5 flex flex-wrap gap-4">
      {status !== "CONFIRMED" && status !== "INVOICE_SENT" ? (
        <>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loadingType !== ""}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-white disabled:opacity-60"
          >
            <CheckCircle className="h-4 w-4" />
            {loadingType === "confirm" ? "Memproses..." : "Confirm"}
          </button>

          <button
            type="button"
            onClick={handleReject}
            disabled={loadingType !== ""}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-white disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" />
            {loadingType === "reject" ? "Memproses..." : "Reject"}
          </button>
        </>
      ) : null}

      {hasInvoice && status === "CONFIRMED" ? (
        <button
          type="button"
          onClick={handleInvoiceSent}
          disabled={loadingType !== ""}
          className="rounded-xl bg-blue-600 px-5 py-3 text-white disabled:opacity-60"
        >
          {loadingType === "invoice" ? "Memproses..." : "Tandai Invoice Sent"}
        </button>
      ) : null}

      {status === "INVOICE_SENT" ? (
        <div className="rounded-xl bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700">
          Invoice sudah ditandai terkirim
        </div>
      ) : null}
    </div>
  );
}
