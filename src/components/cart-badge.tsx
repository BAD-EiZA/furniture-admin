"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import MiniCartPreview from "@/components/mini-cart-preview";

export default function CartBadge() {
    const { totalItems, ready } = useCart();
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
                <ShoppingCart className="h-5 w-5" />

                {ready && totalItems > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[22px] items-center justify-center rounded-full bg-blue-600 px-1.5 py-1 text-[11px] font-bold leading-none text-white shadow-md">
                        {totalItems > 99 ? "99+" : totalItems}
                    </span>
                ) : null}
            </button>

            {open ? (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 top-14 z-40">
                        <MiniCartPreview />
                    </div>
                </>
            ) : null}
        </div>
    );
}