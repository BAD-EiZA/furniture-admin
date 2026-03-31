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
          Perbarui data barang, media katalog, dan stok
        </p>
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        initialValues={{
          name: product.name,
          description: product.description,
          price: String(product.price),
          stock: String(product.stock),
          medias: product.medias.map((item) => ({
            fileUrl: item.fileUrl,
            fileKey: item.fileKey ?? undefined,
            type: item.type,
            sortOrder: item.sortOrder,
          })),
        }}
      />
    </div>
  );
}
