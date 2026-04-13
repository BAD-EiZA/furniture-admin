import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import DeleteUserButton from "@/components/delete-user-button";

export default async function UsersPage() {
  const session = await getSession();

  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ["SUPER_ADMIN", "ADMIN", "SALES"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin & Sales</h2>
          <p className="text-sm text-slate-500">Kelola akun admin dan sales</p>
        </div>

        <Link
          href="/admin/users/new"
          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
        >
          + Tambah User
        </Link>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {users.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-500">
            Belum ada user
          </div>
        ) : (
          <>
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="mt-1 break-all text-sm text-slate-500">
                          {user.email}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                          user.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600">
                      <div className="rounded-xl bg-white px-3 py-2">
                        <span className="font-medium text-slate-900">HP:</span>{" "}
                        {user.phone || "-"}
                      </div>

                      <div className="rounded-xl bg-white px-3 py-2">
                        <span className="font-medium text-slate-900">
                          Role:
                        </span>{" "}
                        {user.role}
                      </div>

                      <div className="rounded-xl bg-white px-3 py-2">
                        <span className="font-medium text-slate-900">
                          Dibuat:
                        </span>{" "}
                        {user.createdAt.toISOString()}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </Link>

                      {user.role !== "SUPER_ADMIN" ? (
                        <DeleteUserButton id={user.id} />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">HP</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.phone || "-"}</td>
                      <td className="px-4 py-3">{user.role}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            user.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/users/${user.id}/edit`}
                            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                          >
                            Edit
                          </Link>

                          {user.role !== "SUPER_ADMIN" ? (
                            <DeleteUserButton id={user.id} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        Belum ada user
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
