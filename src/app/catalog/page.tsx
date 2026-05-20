import Link from "next/link";
import { Search, Sparkles, Tag } from "lucide-react";

import CartBadge from "@/components/cart-badge";
import { getCatalogProducts, getCatalogBrands } from "@/lib/catalog-cache";
import QuickAddToCartButton from "@/components/quick-add-to-cart-button";
import MyOrdersPopover from "@/components/my-orders-popover";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const brand = params.brand?.trim() || "";

  const [products, brands] = await Promise.all([
    getCatalogProducts(q, brand),
    getCatalogBrands(),
  ]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(18,94,169,0.12),_transparent_28%),linear-gradient(to_bottom,_#f8fbff,_#eef5ff)]">
      <section className="border-b z-50 border-slate-200/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e7f6] bg-white/90 px-4 py-2 text-sm text-[#125EA9] shadow-sm">
                <Sparkles className="h-4 w-4" />
                HIRONA HOMEWARE Collection
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Katalog Furniture & Homeware Premium
              </h1>
              <p className="mt-3 max-w-2xl text-slate-500">
                Temukan koleksi furniture dan perabotan pilihan dengan kualitas
                terbaik dan harga terjangkau untuk rumah, kantor, maupun ruang
                usaha.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <MyOrdersPopover />
              <CartBadge />
              <Link
                href="/"
                className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>

          {/* Search */}
          <form className="mt-8 rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-sm">
            <input type="hidden" name="brand" value={brand} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Cari produk, misalnya kursi, meja, lemari..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#125EA9]"
                />
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-[#125EA9] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#125EA9]/20 transition hover:bg-[#0f4f8f]"
              >
                Cari Produk
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* Sidebar Filter Merek */}
          {brands.length > 0 && (
            <aside className="w-full shrink-0 lg:w-56">
              <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4 text-[#125EA9]" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Filter Merek
                  </h3>
                </div>

                <div className="space-y-1">
                  <Link
                    href={`/catalog?q=${encodeURIComponent(q)}`}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                      !brand
                        ? "bg-[#125EA9] font-medium text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Semua Merek
                  </Link>

                  {brands.map((b) => (
                    <Link
                      key={b}
                      href={`/catalog?q=${encodeURIComponent(q)}&brand=${encodeURIComponent(b)}`}
                      className={`flex w-full items-center rounded-xl px-3 py-2 text-sm transition ${
                        brand === b
                          ? "bg-[#125EA9] font-medium text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {b}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Grid Produk */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/85 p-12 text-center shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">
                  Produk Tidak Ditemukan
                </h2>
                <p className="mt-3 text-slate-500">
                  Coba gunakan kata kunci lain atau pilih merek yang berbeda.
                </p>
                <div className="mt-6">
                  <Link
                    href="/catalog"
                    className="inline-flex rounded-2xl bg-[#125EA9] px-5 py-3 text-sm font-medium text-white hover:bg-[#0f4f8f]"
                  >
                    Lihat Semua Produk
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <p className="text-sm text-slate-500">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-900">
                      {products.length}
                    </span>{" "}
                    produk
                    {brand && (
                      <>
                        {" "}merek{" "}
                        <span className="font-semibold text-[#125EA9]">
                          {brand}
                        </span>
                      </>
                    )}
                    {q && (
                      <>
                        {" "}untuk{" "}
                        <span className="font-semibold text-[#125EA9]">
                          &ldquo;{q}&rdquo;
                        </span>
                      </>
                    )}
                  </p>

                  {brand && (
                    <Link
                      href={`/catalog?q=${encodeURIComponent(q)}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium text-[#125EA9] hover:bg-[#ddeaff]"
                    >
                      {brand} ✕
                    </Link>
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => {
                    const image = product.medias?.[0];

                    return (
                      <Link
                        key={product.id}
                        href={`/p/${product.slug}`}
                        className="group overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          <QuickAddToCartButton
                            product={{
                              id: product.id,
                              slug: product.slug,
                              name: product.name,
                              price: Number(product.price),
                              image:
                                image?.type === "IMAGE"
                                  ? image.fileUrl
                                  : undefined,
                            }}
                          />

                          {image?.type === "IMAGE" ? (
                            <img
                              src={image.fileUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                              No image
                            </div>
                          )}

                          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-[#C89B3C] shadow-sm">
                            Premium Choice
                          </div>
                        </div>

                        <div className="p-5">
                          {product.brand && (
                            <span className="mb-2 inline-block rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-medium text-[#125EA9]">
                              {product.brand}
                            </span>
                          )}

                          <h2 className="line-clamp-2 text-lg font-semibold text-slate-900 transition group-hover:text-[#125EA9]">
                            {product.name}
                          </h2>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            {product.description}
                          </p>

                          <div className="mt-5 flex items-center justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">
                                Harga
                              </p>
                              <p className="mt-1 text-lg font-bold text-[#125EA9]">
                                Rp {Number(product.price).toLocaleString("id-ID")}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-[#eef4ff] px-3 py-2 text-xs font-medium text-[#125EA9]">
                              Lihat Detail
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
