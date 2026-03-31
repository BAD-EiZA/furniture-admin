import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold">Furniture Admin</h1>
              <p className="text-sm text-slate-500">
                Halo, {session.name} ({session.role})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>

              <Link
                href="/admin/products"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Produk
              </Link>

              <Link
                href="/admin/orders"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Order
              </Link>

              <Link
                href="/admin/audit-logs"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Audit Log
              </Link>

              {session.role === "SUPER_ADMIN" ? (
                <Link
                  href="/admin/users"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  User
                </Link>
              ) : null}

              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
    </div>
  );
}
