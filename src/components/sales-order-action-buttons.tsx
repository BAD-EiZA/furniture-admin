"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  orderCode: string;
};

export default function SalesOrderActionButtons({ orderId, orderCode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);

  async function handleAction(type: "confirm" | "reject") {
    try {
      setLoading(type);

      const endpoint =
        type === "confirm" ? "/api/orders/confirm" : "/api/orders/reject";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          type === "confirm"
            ? "Gagal mengonfirmasi pembayaran"
            : "Gagal menolak pembayaran",
          {
            description: data.message || "Terjadi kesalahan",
          },
        );
        return;
      }

      toast.success(
        type === "confirm"
          ? "Pembayaran berhasil dikonfirmasi"
          : "Pembayaran berhasil ditolak",
        {
          description: `Order ${orderCode}`,
        },
      );

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat memproses order");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => handleAction("confirm")}
        disabled={loading !== null}
        className="inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
      >
        <CheckCircle2 className="mr-1.5 h-4 w-4" />
        {loading === "confirm" ? "Processing..." : "Accept"}
      </button>

      <button
        type="button"
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
        className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        <XCircle className="mr-1.5 h-4 w-4" />
        {loading === "reject" ? "Processing..." : "Reject"}
      </button>
    </div>
  );
}
