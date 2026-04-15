"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

type MediaItem = {
  fileUrl: string;
  fileKey?: string;
  type: "IMAGE" | "VIDEO";
  sortOrder: number;
};

type TierPriceItem = {
  minQty: string;
  price: string;
  label: string;
};

type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  stock: string;
  readyStock: string;
  allowPreOrder: boolean;
  pcsPerBal: string;
  shippingFee: string;
  isActive: boolean;
  isFeatured: boolean;
  medias: MediaItem[];
  tierPrices: TierPriceItem[];
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initialValues: {
    name: string;
    description: string;
    price: number;
    stock: number;
    readyStock: number;
    allowPreOrder: boolean;
    pcsPerBal: number;
    shippingFee: number;
    isActive: boolean;
    isFeatured: boolean;
    medias: MediaItem[];
    tierPrices: {
      minQty: number;
      price: number;
      label: string;
    }[];
  };
};

function onlyDigits(value: string) {
  return value.replace(/[^\d]/g, "");
}

export default function ProductForm({ mode, productId, initialValues }: Props) {
  const router = useRouter();

  const normalizedInitialValues: ProductFormValues = useMemo(
    () => ({
      ...initialValues,
      price: String(initialValues.price ?? ""),
      stock: String(initialValues.stock ?? ""),
      readyStock: String(initialValues.readyStock ?? ""),
      pcsPerBal: String(initialValues.pcsPerBal ?? ""),
      shippingFee: String(initialValues.shippingFee ?? ""),
      tierPrices:
        initialValues.tierPrices.length > 0
          ? initialValues.tierPrices.map((tier) => ({
              minQty: String(tier.minQty ?? ""),
              price: String(tier.price ?? ""),
              label: tier.label ?? "",
            }))
          : [
              {
                minQty: "1",
                price: "",
                label: "",
              },
            ],
    }),
    [initialValues],
  );

  const [values, setValues] = useState<ProductFormValues>(
    normalizedInitialValues,
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function addTier() {
    setValues((prev) => ({
      ...prev,
      tierPrices: [
        ...prev.tierPrices,
        {
          minQty: "1",
          price: "",
          label: "",
        },
      ],
    }));
  }

  function updateTier<K extends keyof TierPriceItem>(
    index: number,
    key: K,
    value: TierPriceItem[K],
  ) {
    setValues((prev) => ({
      ...prev,
      tierPrices: prev.tierPrices.map((tier, i) =>
        i === index ? { ...tier, [key]: value } : tier,
      ),
    }));
  }

  function removeTier(index: number) {
    setValues((prev) => ({
      ...prev,
      tierPrices: prev.tierPrices.filter((_, i) => i !== index),
    }));
  }

  function removeMedia(index: number) {
    setValues((prev) => ({
      ...prev,
      medias: prev.medias.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!values.name.trim()) {
        setError("Nama produk wajib diisi");
        setLoading(false);
        return;
      }

      if (values.price.trim() === "") {
        setError("Harga dasar wajib diisi");
        setLoading(false);
        return;
      }

      if (values.stock.trim() === "") {
        setError("Total stock wajib diisi");
        setLoading(false);
        return;
      }

      if (values.readyStock.trim() === "") {
        setError("Ready stock wajib diisi");
        setLoading(false);
        return;
      }

      if (values.pcsPerBal.trim() === "") {
        setError("Pcs per bal wajib diisi");
        setLoading(false);
        return;
      }

      if (values.shippingFee.trim() === "") {
        setError("Ongkir per produk wajib diisi");
        setLoading(false);
        return;
      }

      const invalidTier = values.tierPrices.find(
        (tier) =>
          tier.minQty.trim() === "" ||
          tier.price.trim() === "" ||
          Number(tier.minQty) < 1 ||
          Number(tier.price) < 0,
      );

      if (invalidTier) {
        setError("Semua tier pricing wajib diisi dengan benar");
        setLoading(false);
        return;
      }

      const endpoint =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${productId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const payload = {
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
        readyStock: Number(values.readyStock),
        pcsPerBal: Number(values.pcsPerBal),
        shippingFee: Number(values.shippingFee),
        tierPrices: values.tierPrices.map((tier) => ({
          ...tier,
          minQty: Number(tier.minQty),
          price: Number(tier.price),
        })),
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal menyimpan produk");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menyimpan produk");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nama Produk
          </label>
          <input
            type="text"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
            placeholder="Masukkan nama produk"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Harga Dasar
          </label>
          <input
            type="number"
            min={0}
            value={values.price}
            onChange={(e) => updateField("price", onlyDigits(e.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
            placeholder="Masukkan harga dasar"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Deskripsi
        </label>
        <textarea
          value={values.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
          placeholder="Masukkan deskripsi produk"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Total Stock
          </label>
          <input
            type="number"
            min={0}
            value={values.stock}
            onChange={(e) => updateField("stock", onlyDigits(e.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
            placeholder="Masukkan total stock"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Ready Stock
          </label>
          <input
            type="number"
            min={0}
            value={values.readyStock}
            onChange={(e) =>
              updateField("readyStock", onlyDigits(e.target.value))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
            placeholder="Masukkan ready stock"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Pre-Order
          </label>
          <select
            value={values.allowPreOrder ? "true" : "false"}
            onChange={(e) =>
              updateField("allowPreOrder", e.target.value === "true")
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
          >
            <option value="true">Diizinkan</option>
            <option value="false">Tidak diizinkan</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Pcs per Bal
          </label>
          <input
            type="number"
            min={1}
            value={values.pcsPerBal}
            onChange={(e) =>
              updateField("pcsPerBal", onlyDigits(e.target.value))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
            placeholder="Masukkan pcs per bal"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Ongkir per Produk
          </label>
          <input
            type="number"
            min={0}
            value={values.shippingFee}
            onChange={(e) =>
              updateField("shippingFee", onlyDigits(e.target.value))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
            placeholder="Masukkan ongkir"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status Produk
          </label>
          <select
            value={values.isActive ? "true" : "false"}
            onChange={(e) => updateField("isActive", e.target.value === "true")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Produk Unggulan
          </label>
          <select
            value={values.isFeatured ? "true" : "false"}
            onChange={(e) =>
              updateField("isFeatured", e.target.value === "true")
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
          >
            <option value="false">Tidak</option>
            <option value="true">Ya</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe8f7] bg-[#f7fbff] p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Informasi Ongkir Produk
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Ongkir per produk dipakai saat customer memilih pengiriman{" "}
          <span className="font-medium text-slate-700">Luar Kota</span>. Jika
          customer memilih{" "}
          <span className="font-medium text-slate-700">Dalam Kota</span>, maka
          ongkir otomatis 0.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Media Produk</h3>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <UploadButton<OurFileRouter, "productMedia">
            endpoint="productMedia"
            appearance={{
              button:
                "ut-ready:bg-blue-600 ut-uploading:bg-blue-400 rounded-xl px-4 py-2 text-sm font-medium",
              container: "w-full",
              allowedContent: "text-xs text-slate-500 mt-2",
            }}
            onUploadBegin={() => setUploading(true)}
            onClientUploadComplete={(res) => {
              setUploading(false);

              const next = res.map((file, index) => ({
                fileUrl: file.url,
                fileKey: file.key,
                type: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
                sortOrder: values.medias.length + index + 1,
              })) as MediaItem[];

              setValues((prev) => ({
                ...prev,
                medias: [...prev.medias, ...next],
              }));
            }}
            onUploadError={(uploadError: Error) => {
              setUploading(false);
              setError(uploadError.message);
            }}
          />

          {uploading ? (
            <p className="mt-3 text-sm text-blue-600">Sedang upload media...</p>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {values.medias.map((media, index) => (
            <div
              key={`${media.fileUrl}-${index}`}
              className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white"
            >
              <div className="aspect-[4/3] bg-slate-100">
                {media.type === "IMAGE" ? (
                  <img
                    src={media.fileUrl}
                    alt="media"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={media.fileUrl}
                    controls
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="space-y-2 p-3">
                <p className="text-xs text-slate-500">{media.type}</p>
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="w-full rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  Hapus Media
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Tier Pricing</h3>

          <button
            type="button"
            onClick={addTier}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Tambah Tier
          </button>
        </div>

        <div className="space-y-4">
          {values.tierPrices.map((tier, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 lg:grid-cols-[120px_1fr_160px_100px]"
            >
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Min Qty
                </label>
                <input
                  type="number"
                  min={1}
                  value={tier.minQty}
                  onChange={(e) =>
                    updateTier(index, "minQty", onlyDigits(e.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="Min qty"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Label
                </label>
                <input
                  type="text"
                  value={tier.label}
                  onChange={(e) => updateTier(index, "label", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="Retail / Bulk / 1 Bal"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Harga
                </label>
                <input
                  type="number"
                  min={0}
                  value={tier.price}
                  onChange={(e) =>
                    updateTier(index, "price", onlyDigits(e.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
                  placeholder="Masukkan harga"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  disabled={values.tierPrices.length <= 1}
                  className="w-full rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading || uploading}
          className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
