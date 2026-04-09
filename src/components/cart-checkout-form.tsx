"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { UploadButton } from "@uploadthing/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  Copy,
  Landmark,
  QrCode,
  Truck,
  MapPinned,
} from "lucide-react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useCart } from "@/hooks/use-cart";

type SalesOption = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  price: number;
  readyStock: number;
  allowPreOrder: boolean;
  pcsPerBal: number;
  shippingFee: number;
  medias: {
    fileUrl: string;
    type: "IMAGE" | "VIDEO";
  }[];
};

type PaymentProofState = {
  fileUrl: string;
  fileKey?: string;
  mimeType?: string;
} | null;

type SiteSettingLite = {
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  qrisImageUrl: string;
};

const CITY_OPTIONS = [
  "Samarinda",
  "Balikpapan",
  "Bontang",
  "Sangatta",
  "Bengalon",
] as const;

function getBulkDiscountPercent(quantity: number, pcsPerBal = 24) {
  if (pcsPerBal > 0 && quantity >= pcsPerBal) return 0.2;
  if (quantity >= 12) return 0.05;
  return 0;
}

function getDiscountLabel(quantity: number, pcsPerBal = 24) {
  if (pcsPerBal > 0 && quantity >= pcsPerBal) return "Diskon 1 Bal 20%";
  if (quantity >= 12) return "Diskon 12 pcs 5%";
  return "Retail";
}

export default function CartCheckoutForm({
  salesOptions,
  siteSetting,
}: {
  salesOptions: SalesOption[];
  siteSetting: SiteSettingLite;
}) {
  const router = useRouter();
  const { ready, items, updateQty, removeItem, clearCart } = useCart();

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerDistrict, setCustomerDistrict] = useState("");
  const [customerCityDropdown, setCustomerCityDropdown] = useState<
    (typeof CITY_OPTIONS)[number] | ""
  >("");
  const [customerCityText, setCustomerCityText] = useState("");
  const [deliveryAreaType, setDeliveryAreaType] = useState<
    "DALAM_KOTA" | "LUAR_KOTA"
  >("DALAM_KOTA");

  const [salesId, setSalesId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "TRANSFER" | "COD" | "TEMPO" | ""
  >("");
  const [paymentNote, setPaymentNote] = useState("");
  const [acceptPoItems, setAcceptPoItems] = useState(false);
  const [paymentProof, setPaymentProof] = useState<PaymentProofState>(null);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (salesOptions.length > 0 && !salesId) {
      setSalesId(salesOptions[0].id);
    }
  }, [salesOptions, salesId]);

  useEffect(() => {
    async function loadProducts() {
      if (!ready || items.length === 0) return;

      try {
        setLoadingProducts(true);

        const ids = items.map((item) => item.productId).join(",");
        const res = await fetch(`/api/public/products/by-ids?ids=${ids}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Gagal memuat produk di keranjang");
          return;
        }

        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data keranjang");
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, [ready, items]);

  const customerCity =
    deliveryAreaType === "DALAM_KOTA" ? customerCityDropdown : customerCityText;

  const mergedItems = useMemo(() => {
    return items.map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.productId);

      const pcsPerBal = product?.pcsPerBal || 24;
      const discountPercent = getBulkDiscountPercent(
        cartItem.quantity,
        pcsPerBal,
      );
      const discountLabel = getDiscountLabel(cartItem.quantity, pcsPerBal);
      const discountedUnitPrice =
        cartItem.price - cartItem.price * discountPercent;

      const readyQty = Math.min(cartItem.quantity, product?.readyStock || 0);
      const poQty = Math.max(0, cartItem.quantity - readyQty);

      const shippingPerItem =
        deliveryAreaType === "DALAM_KOTA"
          ? 0
          : Number(product?.shippingFee || 0);

      const subtotal =
        (discountedUnitPrice + shippingPerItem) * cartItem.quantity;

      return {
        ...cartItem,
        product,
        discountedUnitPrice,
        shippingPerItem,
        discountPercent,
        discountLabel,
        readyQty,
        poQty,
        subtotal,
      };
    });
  }, [items, products, deliveryAreaType]);

  const hasPoItems = useMemo(
    () => mergedItems.some((item) => item.poQty > 0),
    [mergedItems],
  );

  const subtotal = useMemo(
    () => mergedItems.reduce((sum, item) => sum + item.subtotal, 0),
    [mergedItems],
  );

  const totalShipping = useMemo(
    () =>
      mergedItems.reduce(
        (sum, item) => sum + item.shippingPerItem * item.quantity,
        0,
      ),
    [mergedItems],
  );

  const adjustment = useMemo(() => {
    if (paymentMethod === "TRANSFER") {
      const value = subtotal * 0.01;
      return {
        label: "Potongan Transfer 1%",
        value: -value,
        total: subtotal - value,
      };
    }

    if (paymentMethod === "TEMPO") {
      const value = subtotal * 0.03;
      return {
        label: "Biaya Tempo 3%",
        value,
        total: subtotal + value,
      };
    }

    return {
      label: "Tanpa Penyesuaian",
      value: 0,
      total: subtotal,
    };
  }, [subtotal, paymentMethod]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (items.length === 0) {
        setError("Keranjang masih kosong");
        return;
      }

      if (!customerName.trim()) {
        setError("Nama wajib diisi");
        return;
      }

      if (!customerPhone.trim()) {
        setError("Nomor HP wajib diisi");
        return;
      }

      if (!customerAddress.trim()) {
        setError("Alamat lengkap wajib diisi");
        return;
      }

      if (!customerDistrict.trim()) {
        setError("Kecamatan wajib diisi");
        return;
      }

      if (!customerCity.trim()) {
        setError("Kota wajib diisi");
        return;
      }

      if (!salesId) {
        setError("Nama sales wajib dipilih");
        return;
      }

      if (!paymentMethod) {
        setError("Metode pembayaran wajib dipilih");
        return;
      }

      if (paymentMethod === "TRANSFER" && !paymentProof) {
        setError("Bukti pembayaran wajib untuk metode transfer");
        return;
      }

      if (hasPoItems && !acceptPoItems) {
        setError(
          "Terdapat item pre-order. Silakan centang persetujuan untuk melanjutkan.",
        );
        return;
      }

      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        salesId,
        customerName,
        customerPhone,
        customerAddress,
        customerDistrict,
        customerCity,
        deliveryAreaType,
        paymentMethod,
        paymentNote,
        acceptPoItems,
        paymentProof: paymentProof || undefined,
      };

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal membuat order");
        return;
      }

      toast.success("Pesanan berhasil dibuat", {
        description: `Order Code: ${data.orderCode}`,
      });

      clearCart();
      router.push(
        `/order-success?orderCode=${encodeURIComponent(data.orderCode)}`,
      );
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat checkout");
    } finally {
      setSubmitting(false);
    }
  }

  function applyReadyStockOnly() {
    mergedItems.forEach((item) => {
      if (item.poQty > 0) {
        updateQty(item.productId, item.readyQty);
      }
    });
    setAcceptPoItems(false);
    toast.success("Quantity disesuaikan ke batas ready stock");
  }

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(siteSetting.bankAccountNumber);
      toast.success("Nomor rekening disalin");
    } catch {
      toast.error("Gagal menyalin nomor rekening");
    }
  }

  if (!ready) {
    return (
      <div className="rounded-[30px] border border-slate-200/70 bg-white p-6 shadow-sm">
        Memuat keranjang...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[30px] border border-slate-200/70 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Keranjang Kosong</h2>
        <p className="mt-3 text-slate-500">
          Tambahkan produk terlebih dahulu sebelum checkout.
        </p>
        <div className="mt-6">
          <Link
            href="/catalog"
            className="rounded-2xl bg-[#125EA9] px-5 py-3 text-sm font-medium text-white hover:bg-[#0f4f8f]"
          >
            Ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/95 shadow-xl backdrop-blur"
    >
      <div className="border-b border-slate-200/70 px-6 py-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          Data Pesanan
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Isi data customer satu kali untuk seluruh item dalam keranjang.
        </p>
      </div>

      <div className="space-y-8 px-6 py-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-slate-950">
            Item Keranjang
          </h3>

          <div className="space-y-4">
            {mergedItems.map((item) => (
              <div
                key={item.productId}
                className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <div className="h-20 w-24 overflow-hidden rounded-xl bg-slate-100">
                      {item.product?.medias?.[0]?.type === "IMAGE" ? (
                        <img
                          src={item.product.medias[0].fileUrl}
                          alt={item.name}
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
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Harga awal: Rp {item.price.toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm text-slate-500">
                        Harga final: Rp{" "}
                        {item.discountedUnitPrice.toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm text-slate-500">
                        Diskon: {item.discountLabel}
                      </p>
                      <p className="text-sm text-slate-500">
                        Ongkir/item: Rp{" "}
                        {item.shippingPerItem.toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm text-slate-500">
                        Ready stock: {item.product?.readyStock ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQty(item.productId, Number(e.target.value || 1))
                      }
                      className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.productId);
                        toast.success("Produk dihapus dari keranjang", {
                          description: item.name,
                        });
                      }}
                      className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {item.poQty > 0 ? (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        {item.readyQty} item ready stock, {item.poQty} item
                        masuk kategori pre-order.
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 text-right">
                  <p className="text-sm text-slate-500">
                    Subtotal:{" "}
                    <span className="font-semibold text-slate-900">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasPoItems ? (
          <div className="space-y-3">
            <label className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              <input
                type="checkbox"
                checked={acceptPoItems}
                onChange={(e) => setAcceptPoItems(e.target.checked)}
                className="mt-1"
              />
              <span>
                Saya memahami bahwa sebagian item masuk kategori pre-order dan
                tetap ingin melanjutkan checkout.
              </span>
            </label>

            <button
              type="button"
              onClick={applyReadyStockOnly}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sesuaikan ke Ready Stock
            </button>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-[#125EA9]" />
            <p className="font-medium text-slate-900">Area Pengiriman</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
              <input
                type="radio"
                name="deliveryAreaType"
                checked={deliveryAreaType === "DALAM_KOTA"}
                onChange={() => setDeliveryAreaType("DALAM_KOTA")}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-slate-900">
                  Dalam Kota
                </span>
                Ongkir 0 untuk semua produk
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
              <input
                type="radio"
                name="deliveryAreaType"
                checked={deliveryAreaType === "LUAR_KOTA"}
                onChange={() => setDeliveryAreaType("LUAR_KOTA")}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-slate-900">
                  Luar Kota
                </span>
                Ongkir dihitung per produk
              </span>
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#125EA9]"
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#125EA9]"
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Alamat Lengkap
          </label>
          <textarea
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#125EA9]"
            placeholder="Masukkan alamat lengkap"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kecamatan *
            </label>
            <input
              type="text"
              value={customerDistrict}
              onChange={(e) => setCustomerDistrict(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#125EA9]"
              placeholder="Masukkan kecamatan"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kota *
            </label>

            {deliveryAreaType === "DALAM_KOTA" ? (
              <select
                value={customerCityDropdown}
                onChange={(e) =>
                  setCustomerCityDropdown(
                    e.target.value as (typeof CITY_OPTIONS)[number] | "",
                  )
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#125EA9]"
              >
                <option value="">Pilih kota</option>
                {CITY_OPTIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customerCityText}
                onChange={(e) => setCustomerCityText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#125EA9]"
                placeholder="Masukkan kota"
              />
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nama Sales *
            </label>
            <select
              value={salesId}
              onChange={(e) => setSalesId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#125EA9]"
            >
              <option value="">Pilih sales</option>
              {salesOptions.map((sales) => (
                <option key={sales.id} value={sales.id}>
                  {sales.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Metode Pembayaran *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as "TRANSFER" | "COD" | "TEMPO" | "",
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#125EA9]"
            >
              <option value="">Pilih metode pembayaran</option>
              <option value="TRANSFER">Transfer / Bayar di Muka</option>
              <option value="COD">COD</option>
              <option value="TEMPO">Tempo</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-900">Aturan Pembayaran</p>
          <ul className="mt-3 space-y-2">
            <li>• Transfer / Bayar di Muka: Potongan 1%</li>
            <li>• COD: Harga Normal</li>
            <li>• Tempo: Penambahan 3%</li>
          </ul>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Catatan Pembayaran
          </label>
          <textarea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-[#125EA9]"
            placeholder="Opsional"
          />
        </div>

        {paymentMethod === "TRANSFER" ? (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-[#125EA9]" />
                <p className="font-medium text-slate-900">Rekening Tujuan</p>
              </div>

              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>Bank: {siteSetting.bankName || "-"}</p>
                <p>Atas Nama: {siteSetting.bankAccountName || "-"}</p>
                <div className="flex items-center gap-2">
                  <span>
                    No. Rekening: {siteSetting.bankAccountNumber || "-"}
                  </span>
                  {siteSetting.bankAccountNumber ? (
                    <button
                      type="button"
                      onClick={copyAccountNumber}
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {siteSetting.qrisImageUrl ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-[#125EA9]" />
                  <p className="font-medium text-slate-900">QRIS</p>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={siteSetting.qrisImageUrl}
                    alt="QRIS Hirona"
                    className="mx-auto h-52 w-auto object-contain"
                  />
                </div>
              </div>
            ) : null}

            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">
                Upload Bukti Pembayaran
              </p>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <UploadButton<OurFileRouter, "paymentProof">
                  endpoint="paymentProof"
                  appearance={{
                    button:
                      "ut-ready:bg-[#125EA9] ut-uploading:bg-[#4c83bd] rounded-xl px-4 py-2 text-sm font-medium",
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
                  <p className="mt-3 text-sm text-[#125EA9]">
                    Sedang upload bukti pembayaran...
                  </p>
                ) : null}

                {paymentProof ? (
                  <a
                    href={paymentProof.fileUrl}
                    target="_blank"
                    className="mt-3 inline-block text-sm font-medium text-[#125EA9] underline"
                  >
                    Lihat bukti pembayaran
                  </a>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        <div className="rounded-[24px] bg-gradient-to-r from-[#0e3d6c] via-[#125EA9] to-[#2E4FAE] p-5 text-white">
          <div className="space-y-2 text-sm text-slate-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>

            <div className="flex justify-between">
              <span>Ongkir</span>
              <span>Rp {totalShipping.toLocaleString("id-ID")}</span>
            </div>

            <div className="flex justify-between">
              <span>{adjustment.label}</span>
              <span>
                {adjustment.value < 0 ? "-" : ""}
                Rp {Math.abs(adjustment.value).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-sm text-slate-100">Total Pembayaran</p>
            <p className="mt-2 text-3xl font-bold">
              Rp {adjustment.total.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex justify-start">
          <Link
            href="/catalog"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Lanjut Belanja
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting || uploading || loadingProducts}
          className="w-full rounded-2xl bg-[#125EA9] px-4 py-4 text-sm font-medium text-white shadow-lg shadow-[#125EA9]/20 hover:bg-[#0f4f8f] disabled:opacity-60"
        >
          {submitting ? "Memproses..." : "Buat Pesanan"}
        </button>
      </div>
    </form>
  );
}
