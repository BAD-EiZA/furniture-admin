import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  Gift,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { getProductDetailBySlug } from "@/lib/product-cache";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductImageGallery from "@/components/product-image-gallery";
import CartBadge from "@/components/cart-badge";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductDetailBySlug(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(18,94,169,0.12),_transparent_28%),linear-gradient(to_bottom,_#f8fbff,_#eef5ff)]">
      <section className="border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
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

            <CartBadge />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-4">
            <ProductImageGallery
              medias={product.medias}
              productName={product.name}
            />
          </div>

          <div>
            <div className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-xl backdrop-blur">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e7f6] bg-[#eef4ff] px-4 py-2 text-sm text-[#125EA9]">
                <Sparkles className="h-4 w-4" />
                HIRONA Premium Product
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-[#fff7e8] px-4 py-2 text-sm font-medium text-[#C89B3C]">
                  Furniture & Homeware
                </div>

                <div className="rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-medium text-[#125EA9]">
                  Produk Aktif
                </div>
              </div>

              <div className="mt-6 rounded-[24px] bg-gradient-to-r from-[#0e3d6c] via-[#125EA9] to-[#2E4FAE] p-5 text-white">
                <p className="text-sm text-blue-100">Harga Mulai Dari</p>
                <p className="mt-2 text-3xl font-bold">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </p>
              </div>

              {product.bonusRules?.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {product.bonusRules.map(
                    (rule: {
                      id: string;
                      minQty: number;
                      bonusQty: number;
                      bonusProduct: { name: string };
                    }) => (
                      <div
						  key={rule.id}
						  className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 p-4"
						>
						  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
							<Gift className="h-4 w-4" />
						  </div>
						  {/* Perubahan pada font-bold dan text-red-700 */}
						  <p className="text-sm font-bold text-red-700">
							PROMO pembelian {rule.minQty} Pcs, Bonus {rule.bonusQty} Pcs{" "}
							{rule.bonusProduct?.name}
						  </p>
						</div>
                    ),
                  )}
                </div>
              ) : null}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[#eef4ff] p-2 text-[#125EA9]">
                      <PackageCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Ready Stock</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {product.readyStock} unit tersedia
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[#fff7e8] p-2 text-[#C89B3C]">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Pre-Order</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {product.allowPreOrder ? "Tersedia" : "Tidak tersedia"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold text-slate-950">
                  Deskripsi Produk
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {product.description}
                </p>
              </div>

              {product.tierPrices.length > 0 ? (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-slate-950">
                    Harga Berdasarkan Quantity
                  </h2>

                  <div className="mt-4 space-y-3">
                    {product.tierPrices.map((tier: any) => (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-[#eef4ff] p-2 text-[#125EA9]">
                            <BadgeDollarSign className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {tier.label || `Min ${tier.minQty}`}
                            </p>
                            <p className="text-sm text-slate-500">
                              Minimum {tier.minQty} pcs
                            </p>
                          </div>
                        </div>

                        <p className="font-semibold text-[#125EA9]">
                          Rp {Number(tier.price).toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-8">
                <AddToCartButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: Number(product.price),
                    image:
                      product.medias.find((m: any) => m.type === "IMAGE")
                        ?.fileUrl || undefined,
                  }}
                />
              </div>

              <div className="mt-4">
                <Link
                  href="/catalog"
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Katalog
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#fff7e8] p-2 text-[#C89B3C]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Lokasi HIRONA HOMEWARE
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Jalan rapak Indah no 21 samping bengkel las sugi, kelurahan
                    Lok Bahu, kec. Sungai Kunjang Samarinda. Kaltim
                    <br />
                    <span className="font-medium text-[#C89B3C]">
                      (Rumah cat kuning)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-950">
              Produk Terkait
            </h2>
            <p className="mt-2 text-slate-500">
              Jelajahi pilihan homeware dan furniture premium lainnya dari
              HIRONA.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/p/${item.slug}`}
                className="group overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {item.medias[0]?.type === "IMAGE" ? (
                    <img
                      src={item.medias[0].fileUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-[#125EA9]">
                    {item.name}
                  </h3>
                  <p className="mt-3 text-sm font-bold text-[#125EA9]">
                    Rp {Number(item.price).toLocaleString("id-ID")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
