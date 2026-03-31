"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductMediaUploader, {
  type UploadedMedia,
} from "./product-media-uploader";

type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  stock: string;
  medias: UploadedMedia[];
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: ProductFormValues;
};

const emptyValues: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  medias: [],
};

export default function ProductForm({ mode, productId, initialValues }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    initialValues ?? emptyValues,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${productId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal menyimpan produk");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat menyimpan produk");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <label className="mb-2 block text-sm font-medium">Nama Produk</label>
          <input
            type="text"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Contoh: Sofa Minimalis Oslo"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Deskripsi</label>
          <textarea
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            className="min-h-[140px] w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Tulis deskripsi produk"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Harga</label>
            <input
              type="number"
              min="0"
              value={values.price}
              onChange={(e) => setField("price", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="1500000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Stok</label>
            <input
              type="number"
              min="0"
              value={values.stock}
              onChange={(e) => setField("stock", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="10"
            />
          </div>
        </div>

        <ProductMediaUploader
          value={values.medias}
          onChange={(media) => setField("medias", media)}
        />

        {error ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? "Menyimpan..."
              : mode === "create"
                ? "Simpan Produk"
                : "Update Produk"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Batal
          </button>
        </div>
      </div>
    </form>
  );
}
