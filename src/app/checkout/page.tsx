import {
  CreditCard,
  ShieldCheck,
  Sparkles,
  ShoppingCart,
  MapPin,
  Phone,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/site-settings";
import CartCheckoutForm from "@/components/cart-checkout-form";

export default async function CheckoutPage() {
  const [sales, setting] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "SALES",
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    }),
    getSiteSetting(),
  ]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(18,94,169,0.12),_transparent_28%),linear-gradient(to_bottom,_#f8fbff,_#eef5ff)]">
      <section className="border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e7f6] bg-white/90 px-4 py-2 text-sm text-[#125EA9] shadow-sm">
            <Sparkles className="h-4 w-4" />
            HIRONA HOMEWARE Checkout
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
            Checkout Pesanan
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Tinjau produk dalam keranjang, isi data diri satu kali, lalu
            selesaikan pesanan Anda dengan nyaman.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/90 shadow-sm">
              <div className="space-y-4 p-6">
                <div>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#125EA9]">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Ringkasan Checkout
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    HIRONA HOMEWARE melayani pemesanan beberapa produk sekaligus
                    dalam satu checkout.
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#fff7e8] p-2 text-[#C89B3C]">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          Metode pembayaran fleksibel
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Transfer mendapat potongan 1%, COD normal, dan Tempo
                          menambah 3%.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#eef4ff] p-2 text-[#125EA9]">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          Ready stock & PO otomatis
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Jika jumlah melebihi stok siap kirim, sisa item
                          otomatis masuk pre-order.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#eef2ff] p-2 text-[#2E4FAE]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          Alamat Pengambilan / Pengiriman
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Jalan rapak Indah no 21 samping bengkel las sugi,
                          kelurahan Lok Bahu, kec. Sungai Kunjang Samarinda,
                          Kalimantan Timur.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#eef4ff] p-2 text-[#125EA9]">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          Kontak HIRONA
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Admin, Marketing, dan Sales siap membantu proses
                          pesanan Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">
                Informasi Pembayaran
              </h3>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-900">Bank:</span>{" "}
                  {setting.bankName || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Atas Nama:</span>{" "}
                  {setting.bankAccountName || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-900">
                    No. Rekening:
                  </span>{" "}
                  {setting.bankAccountNumber || "-"}
                </p>
              </div>

              {setting.qrisImageUrl ? (
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={setting.qrisImageUrl}
                    alt="QRIS Hirona"
                    className="mx-auto h-48 w-auto object-contain"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <CartCheckoutForm
              salesOptions={sales}
              siteSetting={{
                bankName: setting.bankName || "",
                bankAccountName: setting.bankAccountName || "",
                bankAccountNumber: setting.bankAccountNumber || "",
                qrisImageUrl: setting.qrisImageUrl || "",
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
