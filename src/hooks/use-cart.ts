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
const CART_EVENT = "cart-updated";

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialItems = readCart();
    setItems(initialItems);
    setReady(true);

    function syncCart() {
      setItems(readCart());
    }

    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const totalItems = useMemo(() => items.length, [items]);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  function addItem(item: CartItem) {
    const currentItems = readCart();
    const existing = currentItems.find((p) => p.productId === item.productId);

    let nextItems: CartItem[];

    if (existing) {
      nextItems = currentItems.map((p) =>
        p.productId === item.productId
          ? { ...p, quantity: p.quantity + item.quantity }
          : p
      );
    } else {
      nextItems = [...currentItems, item];
    }

    writeCart(nextItems);
    setItems(nextItems);
  }

  function updateQty(productId: string, quantity: number) {
    const currentItems = readCart();

    const nextItems = currentItems
      .map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
      .filter((item) => item.quantity > 0);

    writeCart(nextItems);
    setItems(nextItems);
  }

  function removeItem(productId: string) {
    const currentItems = readCart();
    const nextItems = currentItems.filter((item) => item.productId !== productId);

    writeCart(nextItems);
    setItems(nextItems);
  }

  function clearCart() {
    writeCart([]);
    setItems([]);
  }

  return {
    ready,
    items,
    totalItems,     // jumlah jenis item
    totalQuantity,  // total qty semua item, kalau nanti dibutuhkan
    addItem,
    updateQty,
    removeItem,
    clearCart,
  };
}