import Link from "next/link";
import { prisma } from "@/lib/prisma";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function formatPaymentMethod(method: string) {
  if (method === "TRANSFER") return "Transfer";
  if (method === "COD") return "COD";
  if (method === "TEMPO") return "Tempo";
  return method;
}

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const params = await searchParams;
  const phone = params.phone?.trim() || "";
  const normalizedPhone = normalizePhone(phone);

  const orders = normalizedPhone
    ? await prisma.order.findMany({
        where: {
          customerPhoneDraft: {
            contains: normalizedPhone,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          invoice: true,
          paymentProof: true,
          sales: true,
        },
      })
    : [];

  return (
    <div className="min-h-screen bg-[#f7f8fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Pesanan Saya</h1>
          <p className="mt-2 text-sm text-slate-500">
            {normalizedPhone
              ? `Menampilkan pesanan untuk nomor: ${phone}`
              : "Nomor HP belum ditemukan. Silakan checkout sekali dulu atau isi nomor HP di URL."}
          </p>
        </div>

        {!normalizedPhone ? (
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Belum ada nomor HP tersimpan di local storage checkout.
          </div>
        ) : null}

        {normalizedPhone && orders.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200/70 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">Belum ada pesanan untuk nomor ini.</p>
          </div>
        ) : null}

        {orders.map((order) => {
          const totalQty = order.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );

          return (
            <div
              key={order.id}
              className="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    {order.orderCode}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.createdAt.toISOString()}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Pembayaran: {formatPaymentMethod(order.paymentMethod)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Sales: {order.sales?.name || "-"}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <span className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium text-[#125EA9]">
                    {order.status}
                  </span>
                  <p className="mt-3 text-lg font-bold text-slate-950">
                    Rp {Number(order.total).toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-slate-500">
                    {order.items.length} item • Jumlah {totalQty}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <p className="font-medium text-slate-900">
                      {item.product.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Qty {item.quantity} • Ready {item.readyQty} • PO{" "}
                      {item.poQty}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/status/${order.orderCode}`}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Lihat Status
                </Link>

                {order.invoice ? (
                  <a
                    href={`/api/orders/invoice/${order.orderCode}`}
                    target="_blank"
                    className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    Invoice PDF
                  </a>
                ) : null}

                {order.paymentProof ? (
                  <a
                    href={order.paymentProof.fileUrl}
                    target="_blank"
                    className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    Bukti Bayar
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
