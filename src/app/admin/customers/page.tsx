import Link from "next/link";
import { getCustomerList } from "@/lib/customer-cache";

function normalizePhone(phone: string | null | undefined) {
  return String(phone || "").replace(/\D/g, "");
}

function compareIdDesc(a: string, b: string) {
  if (a === b) return 0;
  return a > b ? -1 : 1;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";

  const customers = await getCustomerList(q);

  const spendByPhone = new Map<string, number>();
  const latestCustomerIdByPhone = new Map<string, string>();

  for (const customer of customers as any[]) {
    const phoneKey = normalizePhone(customer.phone);
    if (!phoneKey) continue;

    const totalSpend = customer.orders.reduce(
      (sum: number, order: any) => sum + Number(order.total || 0),
      0,
    );

    spendByPhone.set(phoneKey, (spendByPhone.get(phoneKey) || 0) + totalSpend);

    const currentLatestId = latestCustomerIdByPhone.get(phoneKey);
    if (!currentLatestId || customer.id > currentLatestId) {
      latestCustomerIdByPhone.set(phoneKey, customer.id);
    }
  }

  const customersWithPromoInfo = (customers as any[]).map((customer) => {
    const phoneKey = normalizePhone(customer.phone);
    const totalSpendByPhone = spendByPhone.get(phoneKey) || 0;
    const latestIdForPhone = latestCustomerIdByPhone.get(phoneKey);
    const isLatestForPhone = !!phoneKey && latestIdForPhone === customer.id;
    const promoEligible = totalSpendByPhone >= 100_000_000;
    const showPromoBadge = promoEligible && isLatestForPhone;

    const totalItems = customer.orders.reduce(
      (sum: number, order: any) =>
        sum +
        order.items.reduce(
          (itemSum: number, item: any) => itemSum + Number(item.quantity || 0),
          0,
        ),
      0,
    );

    return {
      ...customer,
      totalItems,
      totalSpendByPhone,
      promoEligible,
      isLatestForPhone,
      showPromoBadge,
    };
  });

  const sortedCustomers = customersWithPromoInfo.sort((a, b) => {
    if (a.showPromoBadge !== b.showPromoBadge) {
      return a.showPromoBadge ? -1 : 1;
    }

    return compareIdDesc(a.id, b.id);
  });

  const loyalCustomers = sortedCustomers.filter(
    (customer) => customer.orders.length > 1,
  ).length;

  const oneTimeCustomers = sortedCustomers.filter(
    (customer) => customer.orders.length === 1,
  ).length;

  const promoCustomers = sortedCustomers.filter(
    (customer) => customer.showPromoBadge,
  ).length;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
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
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Cari
          </button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Pelanggan</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {sortedCustomers.length}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pelanggan Setia</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {loyalCustomers}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pelanggan Sekali Pesan</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {oneTimeCustomers}
          </p>
        </div>

        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm text-emerald-700">Promo 1%</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {promoCustomers}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {sortedCustomers.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-500">
            Belum ada data pelanggan
          </div>
        ) : (
          <>
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {sortedCustomers.map((customer) => {
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
                          {customer.totalItems}
                        </div>
                        <div className="rounded-xl bg-white px-3 py-2">
                          <span className="font-medium text-slate-900">
                            Akumulasi No. HP:
                          </span>{" "}
                          Rp {customer.totalSpendByPhone.toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                        >
                          Detail
                        </Link>

                        {customer.showPromoBadge ? (
                          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                            Mendapat promo 1%
                          </span>
                        ) : null}
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
                  {sortedCustomers.map((customer) => {
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
                          <div className="flex flex-wrap gap-2">
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
                        </td>

                        <td className="px-4 py-3">{customer.orders.length}</td>

                        <td className="px-4 py-3">{customer.totalItems}</td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/admin/customers/${customer.id}`}
                              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                            >
                              Detail
                            </Link>

                            {customer.showPromoBadge ? (
                              <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                                Mendapat promo 1%
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {sortedCustomers.length === 0 ? (
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