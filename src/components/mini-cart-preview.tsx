"use client";

import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

export default function MiniCartPreview() {
  const { ready, items, totalItems, removeItem } = useCart();

  if (!ready) {
    return (
      <div className="w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <p className="text-sm text-slate-500">Memuat keranjang...</p>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:max-w-[340px]">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-slate-700" />
            <p className="font-semibold text-slate-900">Keranjang</p>
          </div>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
            {totalItems} item
          </span>
        </div>
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
                  <div className="h-14 w-16 overflow-hidden rounded-lg bg-slate-100">
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
                    <p className="mt-1 text-xs text-slate-500">
                      Qty {item.quantity}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-blue-700">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      removeItem(item.productId);
                      toast.success("Produk dihapus dari keranjang", {
                        description: item.name,
                      });
                    }}
                    className="self-start rounded-lg p-1 text-slate-400 hover:bg-white hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
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
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
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
