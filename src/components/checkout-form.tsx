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
      className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur"
    >
      <div className="border-b border-slate-200/70 px-6 py-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          Form Pembelian
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Pastikan data yang Anda isi sudah benar sebelum dikirim.
        </p>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nomor HP
          </label>
          <input
            type="text"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500"
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Pilih Sales
          </label>
          <select
            value={salesId}
            onChange={(e) => setSalesId(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500"
          >
            {salesOptions.map((sales) => (
              <option key={sales.id} value={sales.id}>
                {sales.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value || 1))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500"
          />
          <p className="mt-2 text-xs text-slate-500">
            Stok tersedia: {product.stock}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Catatan Pembayaran
          </label>
          <textarea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500"
            placeholder="Opsional"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">
            Upload Bukti Pembayaran
          </p>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <UploadButton<OurFileRouter, "paymentProof">
              endpoint="paymentProof"
              appearance={{
                button:
                  "ut-ready:bg-blue-600 ut-uploading:bg-blue-400 rounded-xl px-4 py-2 text-sm font-medium",
                container: "w-full",
                allowedContent: "text-xs text-slate-500 mt-2",
              }}
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
              onUploadError={(uploadError: Error) => {
                setUploading(false);
                setError(uploadError.message);
              }}
            />

            {uploading ? (
              <p className="mt-3 text-sm text-blue-600">
                Sedang upload bukti pembayaran...
              </p>
            ) : null}

            {paymentProof ? (
              <a
                href={paymentProof.fileUrl}
                target="_blank"
                className="mt-3 inline-block text-sm font-medium text-blue-600 underline"
              >
                Lihat bukti pembayaran
              </a>
            ) : null}
          </div>
        </div>

        <div className="rounded-[24px] bg-slate-950 p-5 text-white">
          <p className="text-sm text-slate-300">Total Pembayaran</p>
          <p className="mt-2 text-3xl font-bold">
            Rp {total.toLocaleString("id-ID")}
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Kirim Bukti Pembayaran"}
        </button>
      </div>
    </form>
  );
}
