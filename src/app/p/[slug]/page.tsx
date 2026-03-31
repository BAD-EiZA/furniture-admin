import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Package, ShieldCheck, ShoppingBag } from "lucide-react";
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

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      NOT: { id: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_28%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)]">
      <section className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-slate-900">
              Katalog
            </Link>
            <span>/</span>
            <span className="text-slate-900">{product.name}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white shadow-sm">
              {product.medias[0] ? (
                product.medias[0].type === "IMAGE" ? (
                  <img
                    src={product.medias[0].fileUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={product.medias[0].fileUrl}
                    controls
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-500">
                  Belum ada media
                </div>
              )}
            </div>

            {product.medias.length > 1 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {product.medias.slice(1).map((media) => (
                  <div
                    key={media.id}
                    className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-sm"
                  >
                    {media.type === "IMAGE" ? (
                      <img
                        src={media.fileUrl}
                        alt={product.name}
                        className="aspect-[4/3] h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={media.fileUrl}
                        controls
                        className="aspect-[4/3] h-full w-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur">
              <div className="border-b border-slate-200/70 px-6 py-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                    Produk Aktif
                  </span>

                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <Package className="mr-1 h-3.5 w-3.5" />
                    Stok {product.stock}
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                  {product.name}
                </h1>

                <p className="mt-4 text-3xl font-bold text-blue-700">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </p>

                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {product.description}
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-blue-100 p-2 text-blue-700">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Pembelian mudah
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Pilih quantity, tentukan sales, unggah bukti pembayaran,
                        lalu tunggu konfirmasi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-emerald-100 p-2 text-emerald-700">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Proses terverifikasi
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Pembayaran akan dicek oleh sales agar transaksi lebih
                        aman dan rapi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href={`/checkout/${product.slug}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
                  >
                    Beli Sekarang
                  </Link>

                  <Link
                    href="/catalog"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Kembali ke Katalog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Produk Lainnya
          </h2>
          <p className="mt-2 text-slate-500">
            Jelajahi pilihan furnitur lain yang mungkin sesuai untuk kebutuhan
            Anda.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((item) => (
            <Link
              key={item.id}
              href={`/p/${item.slug}`}
              className="group overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                {item.medias[0]?.type === "IMAGE" ? (
                  <img
                    src={item.medias[0].fileUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No image
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="line-clamp-1 font-semibold text-slate-900">
                  {item.name}
                </h3>
                <p className="mt-3 text-lg font-bold text-blue-700">
                  Rp {Number(item.price).toLocaleString("id-ID")}
                </p>
              </div>
            </Link>
          ))}

          {relatedProducts.length === 0 ? (
            <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              Belum ada produk terkait.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
