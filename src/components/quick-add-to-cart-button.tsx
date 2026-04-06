"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    image?: string;
  };
};

export default function QuickAddToCartButton({ product }: Props) {
  const { addItem } = useCart();

  function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    toast.success("Produk ditambahkan ke keranjang", {
      description: product.name,
    });
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={`Tambah ${product.name} ke keranjang`}
      className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[#125EA9] shadow-md backdrop-blur transition hover:scale-105 hover:bg-[#125EA9] hover:text-white"
    >
      <ShoppingCart className="h-5 w-5" />
    </button>
  );
}
