import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/checkout-form";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, sales] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        medias: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: "SALES",
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    }),
  ]);

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border bg-white">
            {product.medias[0]?.type === "IMAGE" ? (
              <img
                src={product.medias[0].fileUrl}
                alt={product.name}
                className="w-full object-cover"
              />
            ) : product.medias[0]?.type === "VIDEO" ? (
              <video
                src={product.medias[0].fileUrl}
                controls
                className="w-full object-cover"
              />
            ) : (
              <div className="p-10 text-center text-slate-500">
                Belum ada media
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-xl font-semibold text-blue-700">
              Rp {Number(product.price).toLocaleString("id-ID")}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Stok tersedia: {product.stock}
            </p>
          </div>
        </div>

        <CheckoutForm
          product={{
            id: product.id,
            name: product.name,
            price: Number(product.price),
            stock: product.stock,
          }}
          salesOptions={sales}
        />
      </div>
    </div>
  );
}
