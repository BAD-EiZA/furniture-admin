import Link from "next/link";
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
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-slate-950">Stock History</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Riwayat perubahan stok produk karena update manual atau konfirmasi
          order.
        </p>
      </div>

      <form className="rounded-[28px] border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari nama produk atau catatan..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 sm:w-auto"
          >
            Cari
          </button>
        </div>
      </form>

      <div className="rounded-[28px] border border-slate-200/70 bg-white shadow-sm">
        {histories.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            Belum ada riwayat perubahan stok.
          </div>
        ) : (
          <>
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {histories.map((history) => (
                  <div
                    key={history.id}
                    className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {history.product.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {history.type}
                        </p>
                      </div>

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
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600">
                      <div className="rounded-xl bg-white px-3 py-2">
                        <span className="font-medium text-slate-900">
                          Stock:
                        </span>{" "}
                        {history.stockBefore} → {history.stockAfter}
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        <span className="font-medium text-slate-900">
                          Ready:
                        </span>{" "}
                        {history.readyBefore} → {history.readyAfter}
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        <span className="font-medium text-slate-900">
                          Actor:
                        </span>{" "}
                        {history.actorName || "-"}
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        <span className="font-medium text-slate-900">
                          Catatan:
                        </span>{" "}
                        {history.note || "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
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
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
