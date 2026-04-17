"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteUserButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm("Yakin ingin menonaktifkan user ini?");
    if (!ok) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menonaktifkan user");
        return;
      }

      alert(data.message || "User berhasil dinonaktifkan");
      router.refresh();
    } catch (error) {
      console.error("DELETE_USER_BUTTON_ERROR", error);
      alert("Terjadi kesalahan saat menonaktifkan user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Memproses..." : "Nonaktifkan"}
    </button>
  );
}
