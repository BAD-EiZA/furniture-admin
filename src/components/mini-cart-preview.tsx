"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";

export default function MiniCartPreview() {
  const {
    ready,
    items,
    totalItems,
    totalQuantity,
    removeItem,
    updateQty,
  } = useCart();

  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setQtyInputs((prev) => {
      const next: Record<string, string> = {};

      for (const item of items) {
        next[item.productId] = prev[item.productId] ?? String(item.quantity);
      }

      return next;
    });
  }, [items]);

  if (!ready) {
    return (
      <div className="p-4">
        <p className="text-sm text-slate-500">Memuat keranjang...</p>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  function handleIncrease(productId: string, currentQty: number) {
    const nextQty = currentQty + 1;
    updateQty(productId, nextQty);

    setQtyInputs((prev) => ({
      ...prev,
      [productId]: String(nextQty),
    }));
  }

  function handleDecrease(productId: string, currentQty: number, name: string) {
    if (currentQty <= 1) {
      removeItem(productId);
      setQtyInputs((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });

      toast.success("Produk dihapus dari keranjang", {
        description: name,
      });
      return;
    }

    const nextQty = currentQty - 1;
    updateQty(productId, nextQty);

    setQtyInputs((prev) => ({
      ...prev,
      [productId]: String(nextQty),
    }));
  }

  function handleRemove(productId: string, name: string) {
    removeItem(productId);

    setQtyInputs((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });

    toast.success("Produk dihapus dari keranjang", {
      description: name,
    });
  }

  function handleQtyInputChange(productId: string, value: string) {
    const digitsOnly = value.replace(/\D/g, "");

    setQtyInputs((prev) => ({
      ...prev,
      [productId]: digitsOnly,
    }));
  }

  function commitQty(productId: string, currentQty: number) {
    const rawValue = qtyInputs[productId] ?? String(currentQty);
    const parsed = Number(rawValue);
    const finalQty =
      !rawValue || Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;

    updateQty(productId, finalQty);

    setQtyInputs((prev) => ({
      ...prev,
      [productId]: String(finalQty),
    }));
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-slate-700" />
            <p className="font-semibold text-slate-900">Keranjang</p>
          </div>

          <span className="rounded-full bg-[#eef4ff] px-2 py-1 text-xs font-medium text-[#125EA9]">
            {totalItems} item
          </span>
        </div>

        {items.length > 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            Total quantity: {totalQuantity}
          </p>
        ) : null}
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-500">Keranjang masih kosong.</p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex gap-3">
                  <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-slate-900">
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#125EA9]">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Harga satuan: Rp {item.price.toLocaleString("id-ID")}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleDecrease(item.productId, item.quantity, item.name)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                        aria-label={`Kurangi quantity ${item.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={qtyInputs[item.productId] ?? String(item.quantity)}
                        onChange={(e) =>
                          handleQtyInputChange(item.productId, e.target.value)
                        }
                        onBlur={() => commitQty(item.productId, item.quantity)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitQty(item.productId, item.quantity);
                          }
                        }}
                        className="h-8 w-14 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-semibold text-slate-900 outline-none focus:border-[#125EA9]"
                        aria-label={`Input quantity ${item.name}`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleIncrease(item.productId, item.quantity)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                        aria-label={`Tambah quantity ${item.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.productId, item.name)}
                        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-red-600"
                        aria-label={`Hapus ${item.name} dari keranjang`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">Estimasi subtotal</span>
          <span className="font-semibold text-slate-900">
            Rp {subtotal.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="grid gap-2">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-xl bg-[#125EA9] px-4 py-3 text-sm font-medium text-white hover:bg-[#0f4f8f]"
          >
            Checkout
          </Link>

          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}