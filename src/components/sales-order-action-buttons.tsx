"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send, XCircle } from "lucide-react";
import { toast } from "sonner";

type Props = {
  orderId: string;
  orderCode: string;
  status: string;
  hasInvoice: boolean;
  onActionFinished?: () => void;
};

type ActionType = "confirm" | "reject" | "invoice_sent" | null;

export default function SalesOrderActionButtons({
  orderId,
  orderCode,
  status,
  hasInvoice,
  onActionFinished,
}: Props) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<ActionType>(null);
  const [error, setError] = useState("");

  async function runAction(
    action: Exclude<ActionType, null>,
    endpoint: string,
    successMessage: string,
  ) {
    try {
      setLoadingAction(action);
      setError("");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.message || `Gagal memproses order ${orderCode}`;
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(successMessage);

      router.refresh();

      if (onActionFinished) {
        onActionFinished();
      }
    } catch (err) {
      console.error(`SALES_ORDER_${action.toUpperCase()}_ERROR`, err);
      const message = `Terjadi kesalahan saat memproses order ${orderCode}`;
      setError(message);
      toast.error(message);
    } finally {
      setLoadingAction(null);
    }
  }

  const isWaiting =
    status === "WAITING_CONFIRMATION" || status === "PENDING_PAYMENT";
  const isConfirmed = status === "CONFIRMED";
  const isInvoiceSent = status === "INVOICE_SENT";

  return (
    <div className="flex flex-wrap gap-2">
      {isWaiting ? (
        <>
          <button
            type="button"
            onClick={() =>
              runAction(
                "confirm",
                "/api/orders/confirm",
                "Order berhasil dikonfirmasi",
              )
            }
            disabled={loadingAction !== null}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {loadingAction === "confirm" ? "Confirming..." : "Confirm"}
          </button>

          <button
            type="button"
            onClick={() =>
              runAction(
                "reject",
                "/api/orders/reject",
                "Order berhasil ditolak",
              )
            }
            disabled={loadingAction !== null}
            className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            {loadingAction === "reject" ? "Rejecting..." : "Reject"}
          </button>
        </>
      ) : null}

      {isConfirmed && hasInvoice && !isInvoiceSent ? (
        <button
          type="button"
          onClick={() =>
            runAction(
              "invoice_sent",
              "/api/orders/invoice-sent",
              "Invoice berhasil ditandai terkirim",
            )
          }
          disabled={loadingAction !== null}
          className="inline-flex items-center rounded-lg bg-[#125EA9] px-3 py-2 text-xs font-medium text-white hover:bg-[#0f4f8f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {loadingAction === "invoice_sent" ? "Updating..." : "Invoice Sent"}
        </button>
      ) : null}

      {error ? (
        <div className="w-full rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}

