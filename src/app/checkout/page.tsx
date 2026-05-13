export const dynamic = "force-dynamic";
export const revalidate = 0;

import {
  CreditCard,
  ShieldCheck,
  Sparkles,
  ShoppingCart,
  MapPin,
  Phone,
  ChevronDown,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/site-settings";
import CartCheckoutForm from "@/components/cart-checkout-form";

type BankAccountLite = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  label: string | null;
  isActive: boolean;
  sortOrder: number;
};

const FALLBACK_BANK_ACCOUNTS: BankAccountLite[] = [
  {
    id: "cmosacurs000204jrymsz7w",
    bankName: "BRI",
    accountName: "HIRONA INSPIRASI NUSANTARA",
    accountNumber: "044501001553307",
    label: "BRI PT",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "cmosabpyw000004jkri2vz3",
    bankName: "BCA",
    accountName: "HIRONA INSPIRASI NUSANTARA",
    accountNumber: "7133221176",
    label: "BCA PT",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "cmosae1s5000004l88v5pk3",
    bankName: "BCA",
    accountName: "SUHENKY",
    accountNumber: "4830467420",
    label: "BCA PRIBADI",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "cmosaf7iq000104jdl3dx7",
    bankName: "BRI",
    accountName: "SUHENKY",
    accountNumber: "204501008183503",
    label: "BRI PRIBADI",
    isActive: true,
    sortOrder: 1,
  },
];

function groupBankAccountsByBankName(bankAccounts: BankAccountLite[]) {
  const grouped = new Map<string, BankAccountLite[]>();

  for (const account of bankAccounts) {
    const current = grouped.get(account.bankName) || [];
    current.push(account);
    grouped.set(account.bankName, current);
  }

  return Array.from(grouped.entries()).map(([bankName, accounts]) => ({
    bankName,
    accounts,
  }));
}

export default async function CheckoutPage() {
  const [sales, setting, bankAccounts] = await Promise.all([
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

    prisma.bankAccount.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { bankName: "asc" },
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        bankName: true,
        accountName: true,
        accountNumber: true,
        label: true,
        isActive: true,
        sortOrder: true,
      },
    }),
  ]);

  const activeBankAccounts =
    bankAccounts.length > 0 ? bankAccounts : FALLBACK_BANK_ACCOUNTS;

  const groupedBankAccounts = groupBankAccountsByBankName(activeBankAccounts);

  const qrisImageUrl =
    setting?.qrisImageUrl ||
    "https://res.cloudinary.com/dvbkqu4lh/image/upload/q_auto/f_auto/v1775809994/qris_c2wkhf.jpg";

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

              <div className="mt-4 space-y-3">
                {groupedBankAccounts.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Belum ada rekening aktif yang tersedia.
                  </div>
                ) : (
                  groupedBankAccounts.map((group, index) => (
                    <details
                      key={group.bankName}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                      open={index === 0}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {group.bankName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {group.accounts.length} rekening tersedia
                          </p>
                        </div>

                        <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
                      </summary>

                      <div className="border-t border-slate-200 bg-white px-4 py-4">
                        <div className="space-y-3">
                          {group.accounts.map((account) => (
                            <div
                              key={account.id}
                              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {account.label || account.bankName}
                              </p>

                              <div className="mt-2 space-y-1 text-sm text-slate-600">
                                <p>
                                  <span className="font-medium text-slate-900">
                                    Atas Nama:
                                  </span>{" "}
                                  {account.accountName}
                                </p>

                                <p>
                                  <span className="font-medium text-slate-900">
                                    No. Rekening:
                                  </span>{" "}
                                  <span className="font-semibold tracking-wide text-slate-950">
                                    {account.accountNumber}
                                  </span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  ))
                )}
              </div>

              {qrisImageUrl ? (
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={qrisImageUrl}
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
                qrisImageUrl,
                bankAccounts: activeBankAccounts.map((account) => ({
                  id: account.id,
                  bankName: account.bankName,
                  accountName: account.accountName,
                  accountNumber: account.accountNumber,
                  label: account.label || "",
                })),
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
