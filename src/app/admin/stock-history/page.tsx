import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStockHistoryList } from "@/lib/stock-history-cache";

export default async function StockHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  const histories = await getStockHistoryList(q);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Stock History</h1>
        <p className="mt-2 text-sm text-slate-500">
          Riwayat perubahan stok produk karena update manual atau konfirmasi
          order.
        </p>
      </div>

      <form className="rounded-[28px] border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari nama produk atau catatan..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Cari
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Ready</th>
                <th className="px-4 py-3">Perubahan</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {histories.map((history) => (
                <tr key={history.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {history.product.name}
                  </td>
                  <td className="px-4 py-3">{history.type}</td>
                  <td className="px-4 py-3">
                    {history.stockBefore} → {history.stockAfter}
                  </td>
                  <td className="px-4 py-3">
                    {history.readyBefore} → {history.readyAfter}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        history.changeAmount < 0
                          ? "bg-red-50 text-red-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {history.changeAmount > 0 ? "+" : ""}
                      {history.changeAmount}
                    </span>
                  </td>
                  <td className="px-4 py-3">{history.actorName || "-"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {history.note || "-"}
                  </td>
                </tr>
              ))}

              {histories.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Belum ada riwayat perubahan stok.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <Link
          href="/admin/dashboard"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
