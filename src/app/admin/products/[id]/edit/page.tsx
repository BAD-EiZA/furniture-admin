import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
      },
      tierPrices: {
        orderBy: { minQty: "asc" },
      },
      bonusRules: {
        orderBy: { minQty: "asc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Edit Produk</h2>
        <p className="text-sm text-slate-500">
          Perbarui data barang, media katalog, stok, diskon bal, dan ongkir
          produk
        </p>
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        initialValues={{
          name: product.name,
          description: product.description,
          price: Number(product.price),
          stock: product.stock,
          readyStock: product.readyStock,
          allowPreOrder: product.allowPreOrder,
          pcsPerBal: product.pcsPerBal,
          shippingFee: Number(product.shippingFee || 0),
          brand: product.brand || "",
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          medias: product.medias.map((media) => ({
            fileUrl: media.fileUrl,
            fileKey: media.fileKey || "",
            type: media.type,
            sortOrder: media.sortOrder,
          })),
          tierPrices: product.tierPrices.map((tier) => ({
            minQty: tier.minQty,
            price: Number(tier.price),
            label: tier.label || "",
          })),
          bonusRules: product.bonusRules.map((rule) => ({
            minQty: rule.minQty,
            bonusProductId: rule.bonusProductId,
            bonusQty: rule.bonusQty,
          })),
        }}
      />
    </div>
  );
}
