"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { UploadButton } from "@uploadthing/react";
import { useRouter } from "next/navigation";

import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

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
    medias: {
        fileUrl: string;
        type: "IMAGE" | "VIDEO";
    }[];
    tierPrices: {
        minQty: number;
        price: number;
        label?: string | null;
    }[];
};

type PaymentProofState = {
    fileUrl: string;
    fileKey?: string;
    mimeType?: string;
} | null;

export default function CartCheckoutForm({
    salesOptions,
}: {
    salesOptions: SalesOption[];
}) {
    const router = useRouter();
    const { ready, items, updateQty, removeItem, clearCart } = useCart();

    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [salesId, setSalesId] = useState(salesOptions[0]?.id || "");
    const [paymentMethod, setPaymentMethod] = useState<"TRANSFER" | "COD" | "TEMPO">("TRANSFER");
    const [paymentNote, setPaymentNote] = useState("");
    const [paymentProof, setPaymentProof] = useState<PaymentProofState>(null);

    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

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

    const mergedItems = useMemo(() => {
        return items.map((cartItem) => {
            const product = products.find((p) => p.id === cartItem.productId);

            let selectedPrice = cartItem.price;
            let priceTierLabel = "Retail";

            if (product) {
                const sorted = [...product.tierPrices].sort((a, b) => a.minQty - b.minQty);
                for (const tier of sorted) {
                    if (cartItem.quantity >= tier.minQty) {
                        selectedPrice = Number(tier.price);
                        priceTierLabel = tier.label || `Min ${tier.minQty}`;
                    }
                }
            }

            const subtotal = selectedPrice * cartItem.quantity;

            return {
                ...cartItem,
                product,
                selectedPrice,
                priceTierLabel,
                subtotal,
            };
        });
    }, [items, products]);

    const subtotal = useMemo(
        () => mergedItems.reduce((sum, item) => sum + item.subtotal, 0),
        [mergedItems]
    );

    const adjustment = useMemo(() => {
        if (paymentMethod === "TRANSFER") {
            const value = subtotal * 0.01;
            return {
                label: "Diskon Transfer 1%",
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

            if (paymentMethod === "TRANSFER" && !paymentProof) {
                setError("Bukti pembayaran wajib untuk metode transfer");
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
                paymentMethod,
                paymentNote,
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
            router.push(`/order-success?orderCode=${encodeURIComponent(data.orderCode)}`);
        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan saat checkout");
        } finally {
            setSubmitting(false);
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
                        className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
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
            className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur"
        >
            <div className="border-b border-slate-200/70 px-6 py-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    Data Pesanan
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Isi data customer sekali saja untuk seluruh item dalam keranjang.
                </p>
            </div>

            <div className="space-y-8 px-6 py-6">
                <div>
                    <h3 className="mb-4 text-lg font-semibold text-slate-950">Item Keranjang</h3>

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
                                            <p className="font-semibold text-slate-900">{item.name}</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Harga: Rp {item.selectedPrice.toLocaleString("id-ID")}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Tier: {item.priceTierLabel}
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
                                            onChange={(e) => {
                                                const nextQty = Number(e.target.value || 1);
                                                updateQty(item.productId, nextQty);
                                            }}
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

                <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
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
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
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
                        className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
                        placeholder="Masukkan alamat lengkap"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Pilih Sales
                        </label>
                        <select
                            value={salesId}
                            onChange={(e) => setSalesId(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
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
                            Metode Pembayaran
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) =>
                                setPaymentMethod(e.target.value as "TRANSFER" | "COD" | "TEMPO")
                            }
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
                        >
                            <option value="TRANSFER">Transfer Sebelum Pengiriman</option>
                            <option value="COD">COD</option>
                            <option value="TEMPO">Tempo</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Catatan Pembayaran
                    </label>
                    <textarea
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
                        placeholder="Opsional"
                    />
                </div>

                {paymentMethod === "TRANSFER" ? (
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
                ) : null}

                <div className="rounded-[24px] bg-slate-950 p-5 text-white">
                    <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
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
                        <p className="text-sm text-slate-300">Total Pembayaran</p>
                        <p className="mt-2 text-3xl font-bold">
                            Rp {adjustment.total.toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>

                <div className="flex justify-start">
                    <Link
                        href="/catalog"
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Lanjut Belanja
                    </Link>
                </div>

                {error ? (
                    <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={submitting || uploading || loadingProducts}
                    className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60"
                >
                    {submitting ? "Memproses..." : "Buat Pesanan"}
                </button>
            </div>
        </form>
    );
}