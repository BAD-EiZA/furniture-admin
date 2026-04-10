"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteBankAccountButton({
  bankAccountId,
  label,
}: {
  bankAccountId: string;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(`Hapus rekening ${label}?`);
    if (!ok) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/bank-accounts/${bankAccountId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menghapus rekening");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus rekening");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
    >
      {loading ? "Menghapus..." : "Hapus"}
    </button>
  );
}
