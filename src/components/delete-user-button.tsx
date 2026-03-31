"use client";

import { useRouter } from "next/navigation";

export default function DeleteUserButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const ok = window.confirm("Yakin ingin menghapus user ini?");
    if (!ok) return;

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Gagal menghapus user");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
    >
      Hapus
    </button>
  );
}
