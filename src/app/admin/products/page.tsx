import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteProductButton from "@/components/delete-product-button";
import { getPageParams } from "@/lib/pagination";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; limit?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status || "all"; // "all" | "active" | "inactive"
  const { page, limit, skip } = getPageParams(params);

  const statusFilter =
    status === "active"
      ? { isActive: true }
      : status === "inactive"
        ? { isActive: false }
        : {};

  const where = {
    ...statusFilter,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [products, total, totalActive, totalInactive] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        medias: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: false } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function buildHref(overrides: Record<string, string>) {
    const merged = { q, page: String(page), limit: String(limit), status, ...overrides };
    const qs = new URLSearchParams(merged).toString();
    return `/admin/products?${qs}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Produk</h2>
          <p className="text-sm text-slate-500">Kelola daftar barang furnitur</p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
        >
          + Tambah Produk
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref({ status: "all", page: "1" })}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            status === "all"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua ({totalActive + totalInactive})
        </Link>

        <Link
          href={buildHref({ status: "active", page: "1" })}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            status === "active"
              ? "bg-emerald-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Aktif ({totalActive})
        </Link>

        <Link
          href={buildHref({ status: "inactive", page: "1" })}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            status === "inactive"
              ? "bg-red-600 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-500" />
          Tidak Aktif ({totalInactive})
        </Link>
      </div>

      {/* Search */}
      <form className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <input type="hidden" name="status" value={status} />
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari nama, slug, deskripsi..."
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 sm:w-auto"
          >
            Cari
          </button>
        </div>
      </form>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {products.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-500">
            Belum ada produk
          </div>
        ) : (
          <>
            {/* Mobile view */}
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`rounded-2xl border p-4 ${
                      product.isActive
                        ? "border-slate-200/70 bg-slate-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {product.medias[0]?.type === "IMAGE" ? (
                          <img
                            src={product.medias[0].fileUrl}
                            alt={product.name}
                            className={`h-full w-full object-cover ${
                              !product.isActive ? "opacity-40 grayscale" : ""
                            }`}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-500">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`font-semibold ${
                              product.isActive ? "text-slate-900" : "text-red-800"
                            }`}
                          >
                            {product.name}
                          </p>
                          {!product.isActive && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                              Tidak Aktif
                            </span>
                          )}
                          {product.isActive && (product as any).isFeatured && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                              Unggulan
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Slug: {product.slug}</p>
                        <p className="mt-1 text-xs text-slate-500">Stock: {product.stock}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={product.id} />
                      <Link
                        href={`/admin/products/${product.id}/qr`}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        QR
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop view */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3">Harga</th>
                    <th className="px-4 py-3">Stok</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className={`border-t ${!product.isActive ? "bg-red-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-20 overflow-hidden rounded-lg bg-slate-100">
                            {product.medias[0]?.type === "IMAGE" ? (
                              <img
                                src={product.medias[0].fileUrl}
                                alt={product.name}
                                className={`h-full w-full object-cover ${
                                  !product.isActive ? "opacity-40 grayscale" : ""
                                }`}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                                No image
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p
                                className={`font-semibold ${
                                  !product.isActive ? "text-red-800" : "text-slate-900"
                                }`}
                              >
                                {product.name}
                              </p>
                              {product.isActive && (product as any).isFeatured && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                  Unggulan
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {product.medias.length} media
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3">{product.stock}</td>
                      <td className="px-4 py-3 text-slate-500">{product.slug}</td>

                      <td className="px-4 py-3">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Tidak Aktif
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton id={product.id} />
                          <Link
                            href={`/admin/products/${product.id}/qr`}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          >
                            QR
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-500">
          Halaman {page} dari {totalPages} • Total {total} produk
        </p>

        <div className="flex gap-2">
          <Link
            href={buildHref({ page: String(Math.max(1, page - 1)) })}
            className={`flex-1 rounded-lg px-3 py-2 text-center sm:flex-none ${
              page <= 1
                ? "pointer-events-none bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Prev
          </Link>

          <Link
            href={buildHref({ page: String(Math.min(totalPages, page + 1)) })}
            className={`flex-1 rounded-lg px-3 py-2 text-center sm:flex-none ${
              page >= totalPages
                ? "pointer-events-none bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
