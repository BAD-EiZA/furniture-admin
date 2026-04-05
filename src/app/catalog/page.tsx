import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CartBadge from "@/components/cart-badge";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  const where = {
    isActive: true,
    ...(q
      ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_30%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)]">
      <section className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
                <Sparkles className="h-4 w-4" />
                Modern furniture collection
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Katalog Produk
              </h1>
              <p className="mt-2 max-w-2xl text-slate-500">
                Temukan furnitur yang sesuai dengan kebutuhan Anda melalui
                katalog yang lebih bersih, cepat, dan nyaman dijelajahi.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <CartBadge />

              <Link
                href="/"
                className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form className="mb-8 overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/85 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Cari produk, model, atau deskripsi..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 outline-none transition focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Cari Produk
            </button>
          </div>
        </form>

        {products.length > 0 ? (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Menampilkan{" "}
              <span className="font-medium text-slate-700">
                {products.length}
              </span>{" "}
              produk
              {q ? (
                <>
                  {" "}
                  untuk pencarian{" "}
                  <span className="font-medium text-slate-700">"{q}"</span>
                </>
              ) : null}
            </p>
          </div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/p/${product.slug}`}
              className="group overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                {product.medias[0]?.type === "IMAGE" ? (
                  <img
                    src={product.medias[0].fileUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No image
                  </div>
                )}

                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
                  Stok {product.stock}
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <h2 className="line-clamp-1 text-lg font-semibold text-slate-900">
                    {product.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Price
                    </p>
                    <p className="text-xl font-bold text-blue-700">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-blue-600">
                    Lihat
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="mt-10 overflow-hidden rounded-[32px] border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto max-w-xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                <Search className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Produk tidak ditemukan
              </h2>
              <p className="mt-3 text-slate-500">
                Coba gunakan kata kunci lain atau kembali lihat seluruh katalog
                produk yang tersedia.
              </p>
              <div className="mt-6">
                <Link
                  href="/catalog"
                  className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Reset Pencarian
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
