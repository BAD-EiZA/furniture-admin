"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import MiniCartPreview from "@/components/mini-cart-preview";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CartBadge() {
  const { totalItems, ready } = useCart();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          aria-label="Buka keranjang"
        >
          <ShoppingCart className="h-5 w-5" />

          {ready && totalItems > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#125EA9] px-1.5 py-1 text-[11px] font-bold leading-none text-white shadow-md">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="z-50 w-[calc(100vw-2rem)] max-w-[340px] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl"
      >
        <MiniCartPreview />
      </PopoverContent>
    </Popover>
  );
}
