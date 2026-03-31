"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserFormValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "ADMIN" | "SALES";
  isActive: boolean;
};

type Props = {
  mode: "create" | "edit";
  userId?: string;
  initialValues?: UserFormValues;
};

const emptyValues: UserFormValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "ADMIN",
  isActive: true,
};

export default function UserForm({ mode, userId, initialValues }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<UserFormValues>(
    initialValues ?? emptyValues,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof UserFormValues>(
    key: K,
    value: UserFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "create" ? "/api/admin/users" : `/api/admin/users/${userId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const payload =
        mode === "create"
          ? {
              name: values.name,
              email: values.email,
              phone: values.phone,
              password: values.password,
              role: values.role,
            }
          : values;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal menyimpan user");
        return;
      }

      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat menyimpan user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <label className="mb-2 block text-sm font-medium">Nama</label>
          <input
            type="text"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Nama user"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Nomor HP</label>
            <input
              type="text"
              value={values.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              placeholder="08xxxxxxxxxx"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              {mode === "create" ? "Password" : "Password Baru"}
            </label>
            <input
              type="password"
              value={values.password}
              onChange={(e) => setField("password", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              placeholder={
                mode === "create"
                  ? "Minimal 6 karakter"
                  : "Kosongkan jika tidak diubah"
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>
            <select
              value={values.role}
              onChange={(e) =>
                setField("role", e.target.value as "ADMIN" | "SALES")
              }
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SALES">SALES</option>
            </select>
          </div>
        </div>

        {mode === "edit" ? (
          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <select
              value={values.isActive ? "true" : "false"}
              onChange={(e) => setField("isActive", e.target.value === "true")}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? "Menyimpan..."
              : mode === "create"
                ? "Simpan User"
                : "Update User"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Batal
          </button>
        </div>
      </div>
    </form>
  );
}
