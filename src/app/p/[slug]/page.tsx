import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {product.medias.length > 0 ? (
            product.medias.map((media) => (
              <div
                key={media.id}
                className="overflow-hidden rounded-2xl border bg-white"
              >
                {media.type === "IMAGE" ? (
                  <img
                    src={media.fileUrl}
                    alt={product.name}
                    className="w-full object-cover"
                  />
                ) : (
                  <video
                    src={media.fileUrl}
                    controls
                    className="w-full object-cover"
                  />
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border bg-slate-50 p-10 text-center text-slate-500">
              Belum ada media
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl font-semibold text-blue-700">
            Rp {Number(product.price).toLocaleString("id-ID")}
          </p>
          <p className="text-sm text-slate-500">
            Stok tersedia: {product.stock}
          </p>
          <p className="leading-7 text-slate-700">{product.description}</p>

          <a
            href={`/checkout/${product.slug}`}
            className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Beli Barang Ini
          </a>
        </div>
      </div>
    </div>
  );
}
