"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

type Props = {
    product: {
        id: string;
        slug: string;
        name: string;
        price: any;
        image?: string;
    };
};

export default function AddToCartButton({ product }: Props) {
    const router = useRouter();
    const { addItem } = useCart();

    function handleAdd() {
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
        <div className="grid gap-3 sm:grid-cols-3">
            <button
                type="button"
                onClick={handleAdd}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                Tambah ke Keranjang
            </button>

            <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-medium text-white hover:bg-blue-700"
            >
                Checkout Sekarang
            </button>

            <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="rounded-2xl border border-slate-200 bg-slate-900 px-5 py-3.5 text-sm font-medium text-white hover:bg-slate-800"
            >
                Lihat Keranjang
            </button>
        </div>
    );
}