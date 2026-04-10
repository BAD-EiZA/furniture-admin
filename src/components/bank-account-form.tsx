"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BankAccountFormValues = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
};

type Props = {
  mode: "create" | "edit";
  bankAccountId?: string;
  initialValues: BankAccountFormValues;
};

export default function BankAccountForm({
  mode,
  bankAccountId,
  initialValues,
}: Props) {
  const router = useRouter();

  const [values, setValues] = useState<BankAccountFormValues>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof BankAccountFormValues>(
    key: K,
    value: BankAccountFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "create"
          ? "/api/admin/bank-accounts"
          : `/api/admin/bank-accounts/${bankAccountId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal menyimpan rekening");
        return;
      }

      router.push("/admin/bank-accounts");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menyimpan rekening");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nama Bank
          </label>
          <input
            type="text"
            value={values.bankName}
            onChange={(e) => updateField("bankName", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
            placeholder="Contoh: BCA / BRI"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Label
          </label>
          <input
            type="text"
            value={values.label}
            onChange={(e) => updateField("label", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
            placeholder="Contoh: BCA 2 / BRI 2"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Atas Nama
          </label>
          <input
            type="text"
            value={values.accountName}
            onChange={(e) => updateField("accountName", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
            placeholder="Nama pemilik rekening"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Nomor Rekening
          </label>
          <input
            type="text"
            value={values.accountNumber}
            onChange={(e) => updateField("accountNumber", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
            placeholder="Nomor rekening"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Urutan Tampil
          </label>
          <input
            type="number"
            min={1}
            value={values.sortOrder}
            onChange={(e) =>
              updateField("sortOrder", Number(e.target.value || 1))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            value={values.isActive ? "true" : "false"}
            onChange={(e) => updateField("isActive", e.target.value === "true")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-blue-500"
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading
            ? "Menyimpan..."
            : mode === "create"
              ? "Simpan Rekening"
              : "Update Rekening"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/bank-accounts")}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
