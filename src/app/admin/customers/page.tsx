import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCustomerList } from "@/lib/customer-cache";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  const where = q
    ? {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { phone: { contains: q, mode: "insensitive" as const } },
      ],
    }
    : {};

  const customers = await getCustomerList(q);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Pelanggan</h1>
        <p className="mt-2 text-sm text-slate-500">
          Daftar pelanggan yang sudah memiliki pesanan terverifikasi.
        </p>
      </div>

      <form className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari nama atau nomor HP..."
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Pelanggan</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {customers.length}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pelanggan Setia</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {customers.filter((customer) => customer.orders.length > 1).length}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pelanggan Sekali Pesan</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {
              customers.filter((customer) => customer.orders.length === 1)
                .length
            }
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
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
            {customers.map((customer) => {
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
    </div>
  );
}
