import Link from "next/link";
import { getCustomerList } from "@/lib/customer-cache";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  const customers = await getCustomerList(q);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-bold text-slate-950">Pelanggan</h1>
        <p className="mt-2 text-sm text-slate-500">
          Daftar pelanggan yang sudah memiliki pesanan terverifikasi.
        </p>
      </div>

      <form className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari nama atau nomor HP..."
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Pelanggan</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {customers.length}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pelanggan Setia</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {
              customers.filter((customer: any) => customer.orders.length > 1)
                .length
            }
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <p className="text-sm text-slate-500">Pelanggan Sekali Pesan</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {
              customers.filter((customer: any) => customer.orders.length === 1)
                .length
            }
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {customers.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-500">
            Belum ada data pelanggan
          </div>
        ) : (
          <>
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {customers.map((customer: any) => {
                  const totalItems = customer.orders.reduce(
                    (sum: any, order: any) =>
                      sum +
                      order.items.reduce(
                        (itemSum: any, item: any) => itemSum + item.quantity,
                        0,
                      ),
                    0,
                  );

                  const isRepeat = customer.orders.length > 1;

                  return (
                    <div
                      key={customer.id}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {customer.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {customer.phone}
                          </p>
                        </div>

                        {isRepeat ? (
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            Pelanggan Setia
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            Pelanggan Baru
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-slate-600">
                        <div className="rounded-xl bg-white px-3 py-2">
                          <span className="font-medium text-slate-900">
                            Total Pesanan:
                          </span>{" "}
                          {customer.orders.length}
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2">
                          <span className="font-medium text-slate-900">
                            Jumlah Item:
                          </span>{" "}
                          {totalItems}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Detail
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">No HP</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total Pesanan</th>
                    <th className="px-4 py-3">Jumlah Item</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer: any) => {
                    const totalItems = customer.orders.reduce(
                      (sum: any, order: any) =>
                        sum +
                        order.items.reduce(
                          (itemSum: any, item: any) => itemSum + item.quantity,
                          0,
                        ),
                      0,
                    );

                    const isRepeat = customer.orders.length > 1;

                    return (
                      <tr key={customer.id} className="border-t">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900">
                              {customer.name}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3">{customer.phone}</td>

                        <td className="px-4 py-3">
                          {isRepeat ? (
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                              Pelanggan Setia
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                              Pelanggan Baru
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">{customer.orders.length}</td>

                        <td className="px-4 py-3">{totalItems}</td>

                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })}

                  {customers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        Belum ada data pelanggan
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
