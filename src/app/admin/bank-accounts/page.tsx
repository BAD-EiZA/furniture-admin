import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import DeleteBankAccountButton from "@/components/delete-bank-account-button";

export default async function BankAccountsPage() {

  const bankAccounts = await prisma.bankAccount.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Rekening Bank</h2>
          <p className="text-sm text-slate-500">
            Kelola daftar rekening yang tampil di halaman checkout
          </p>
        </div>

        <Link
          href="/admin/bank-accounts/create"
          className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Tambah Rekening
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">Urutan</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Bank</th>
                <th className="px-4 py-3">Atas Nama</th>
                <th className="px-4 py-3">No. Rekening</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bankAccounts.map((account) => (
                <tr key={account.id} className="border-t">
                  <td className="px-4 py-3">{account.sortOrder}</td>
                  <td className="px-4 py-3">{account.label || "-"}</td>
                  <td className="px-4 py-3">{account.bankName}</td>
                  <td className="px-4 py-3">{account.accountName}</td>
                  <td className="px-4 py-3">{account.accountNumber}</td>
                  <td className="px-4 py-3">
                    {account.isActive ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/bank-accounts/${account.id}`}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </Link>

                      <DeleteBankAccountButton
                        bankAccountId={account.id}
                        label={account.label || account.bankName}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {bankAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Belum ada rekening bank
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
