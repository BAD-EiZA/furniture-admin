"use client";

import { useEffect, useMemo, useState } from "react";

export type CartItem = {
    productId: string;
    slug: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
};

const STORAGE_KEY = "furniture_cart";

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setItems(JSON.parse(raw));
            }
        } catch (error) {
            console.error("LOAD_CART_ERROR", error);
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        if (!ready) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error("SAVE_CART_ERROR", error);
        }
    }, [items, ready]);

    const totalItems = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items]
    );

    function addItem(item: CartItem) {
        setItems((prev) => {
            const existing = prev.find((p) => p.productId === item.productId);

            if (existing) {
                return prev.map((p) =>
                    p.productId === item.productId
                        ? { ...p, quantity: p.quantity + item.quantity }
                        : p
                );
            }

            return [...prev, item];
        });
    }

    function updateQty(productId: string, quantity: number) {
        setItems((prev) =>
            prev
                .map((item) =>
                    item.productId === productId ? { ...item, quantity } : item
                )
                .filter((item) => item.quantity > 0)
        );
    }

    function removeItem(productId: string) {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
    }

    function clearCart() {
        setItems([]);
    }

    return {
        ready,
        items,
        totalItems,
        addItem,
        updateQty,
        removeItem,
        clearCart,
    };
}