"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
  salesOptions: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  }[];
};

type ProofState = {
  fileUrl: string;
  fileKey?: string;
  mimeType?: string;
} | null;

export default function CheckoutForm({ product, salesOptions }: Props) {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [salesId, setSalesId] = useState(salesOptions[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentProof, setPaymentProof] = useState<ProofState>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(
    () => product.price * quantity,
    [product.price, quantity],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!paymentProof) {
        setError("Bukti pembayaran wajib diupload");
        return;
      }

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          salesId,
          customerName,
          customerPhone,
          paymentNote,
          paymentProof,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal membuat order");
        return;
      }

      router.push(`/status/${data.orderCode}`);
    } catch {
      setError("Terjadi kesalahan saat checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <div>
        <h2 className="text-2xl font-bold">Form Pembelian</h2>
        <p className="text-sm text-slate-500">
          Isi data diri dan unggah bukti pembayaran
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Nama</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Nomor HP</label>
        <input
          type="text"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Pilih Sales</label>
        <select
          value={salesId}
          onChange={(e) => setSalesId(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
        >
          {salesOptions.map((sales) => (
            <option key={sales.id} value={sales.id}>
              {sales.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Quantity</label>
        <input
          type="number"
          min={1}
          max={product.stock}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value || 1))}
          className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Catatan Pembayaran
        </label>
        <textarea
          value={paymentNote}
          onChange={(e) => setPaymentNote(e.target.value)}
          className="min-h-[100px] w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          placeholder="Opsional"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Upload Bukti Pembayaran</p>

        <UploadButton<OurFileRouter, "paymentProof">
          endpoint="paymentProof"
          onUploadBegin={() => setUploading(true)}
          onClientUploadComplete={(res) => {
            setUploading(false);

            const first = res[0];
            if (!first) return;

            setPaymentProof({
              fileUrl: first.url,
              fileKey: first.key,
              mimeType: first.type,
            });
          }}
          onUploadError={(error: Error) => {
            setUploading(false);
            setError(error.message);
          }}
        />

        {uploading ? (
          <p className="mt-2 text-sm text-blue-600">Sedang upload...</p>
        ) : null}

        {paymentProof ? (
          <a
            href={paymentProof.fileUrl}
            target="_blank"
            className="mt-2 inline-block text-sm text-blue-600 underline"
          >
            Lihat bukti pembayaran
          </a>
        ) : null}
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Total</p>
        <p className="text-2xl font-bold">Rp {total.toLocaleString("id-ID")}</p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Kirim Bukti Pembayaran"}
      </button>
    </form>
  );
}
