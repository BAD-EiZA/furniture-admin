import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteProductButton from "@/components/delete-product-button";
import { getPageParams } from "@/lib/pagination";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const { page, limit, skip } = getPageParams(params);

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
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
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Produk</h2>
          <p className="text-sm text-slate-500">
            Kelola daftar barang furnitur
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Tambah Produk
        </Link>
      </div>

      <form className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
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
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Cari
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-20 overflow-hidden rounded-lg bg-slate-100">
                        {product.medias[0]?.type === "IMAGE" ? (
                          <img
                            src={product.medias[0].fileUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-500">
                            No image
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold">{product.name}</p>
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

              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Belum ada produk
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-500">
          Halaman {page} dari {totalPages} • Total {total} produk
        </p>

        <div className="flex gap-2">
          <Link
            href={`/admin/products?q=${encodeURIComponent(q)}&page=${Math.max(
              1,
              page - 1,
            )}&limit=${limit}`}
            className={`rounded-lg px-3 py-2 ${
              page <= 1
                ? "pointer-events-none bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Prev
          </Link>

          <Link
            href={`/admin/products?q=${encodeURIComponent(q)}&page=${Math.min(
              totalPages,
              page + 1,
            )}&limit=${limit}`}
            className={`rounded-lg px-3 py-2 ${
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
