import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerDetail } from "@/lib/customer-cache";

function formatPaymentMethod(method: string) {
  if (method === "TRANSFER") return "Transfer";
  if (method === "COD") return "COD";
  if (method === "TEMPO") return "Tempo";
  return method;
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await getCustomerDetail(id);

  if (!customer) notFound();

  const totalOrders = customer.orders.length;
  const totalSpend = customer.orders.reduce(
    (sum:any, order:any) => sum + Number(order.total),
    0
  );
  const totalItems = customer.orders.reduce(
    (sum:any, order:any) =>
      sum + order.items.reduce((itemSum:any, item:any) => itemSum + item.quantity, 0),
    0
  );
  const repeatCustomer = totalOrders > 1;
  const promoEligible = customer.promoEligible;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Detail Pelanggan
            </h1>
            <p className="mt-2 text-sm text-slate-500">{customer.name}</p>
          </div>

          <Link
            href="/admin/customers"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Kembali
          </Link>
        </div>
      </div>

      {promoEligible ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Indikator Promo
          </p>
          <p className="mt-2 text-lg font-bold text-emerald-700">
            CUSTOMER INI BERHAK MENDAPAT PROMO 10%
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            Akumulasi belanja dari nama dan nomor HP ini sudah mencapai minimal
            Rp 100.000.000.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Pesanan</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{totalOrders}</p>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Item</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{totalItems}</p>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Belanja</p>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            Rp {totalSpend.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {repeatCustomer ? (
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                Pelanggan Setia
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                Pelanggan Baru
              </span>
            )}

            {promoEligible ? (
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Promo 10%
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Informasi Pelanggan
        </h2>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-900">Nama:</span>{" "}
            {customer.name}
          </p>
          <p>
            <span className="font-medium text-slate-900">No HP:</span>{" "}
            {customer.phone}
          </p>
          <p>
            <span className="font-medium text-slate-900">
              Digabung dari record customer:
            </span>{" "}
            {customer.sourceCustomerIds.length}
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          Riwayat Pesanan
        </h2>

        <div className="mt-5 space-y-4">
          {customer.orders.map((order: any) => {
            const totalQty = order.items.reduce(
              (sum: any, item: any) => sum + item.quantity,
              0
            );
            const totalPo = order.items.reduce(
              (sum: any, item: any) => sum + item.poQty,
              0
            );

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {order.orderCode}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.createdAt.toISOString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Sales: {order.sales.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Pembayaran: {formatPaymentMethod(order.paymentMethod)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Status: {order.status}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="font-semibold text-slate-900">
                      Rp {Number(order.total).toLocaleString("id-ID")}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.items.length} item • Jml {totalQty}
                    </p>
                    {totalPo > 0 ? (
                      <p className="mt-1 inline-flex rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                        PO {totalPo}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-white px-4 py-3 text-sm text-slate-600"
                    >
                      <span className="font-medium text-slate-900">
                        {item.product.name}
                      </span>{" "}
                      • Jml {item.quantity} • Ready {item.readyQty} • PO {item.poQty}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Lihat Detail Pesanan
                  </Link>

                  <Link
                    href={`/status/${order.orderCode}`}
                    className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    Halaman Status
                  </Link>

                  {order.invoice ? (
                    <a
                      href={`/api/orders/invoice/${order.orderCode}`}
                      target="_blank"
                      className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      Faktur PDF
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}

          {customer.orders.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada riwayat pesanan.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
