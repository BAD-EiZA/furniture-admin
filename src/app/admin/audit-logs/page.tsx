import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function AuditLogsPage() {
  const session = await getSession();

  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Audit Log</h2>
        <p className="text-sm text-slate-500">
          Riwayat aktivitas penting admin dan sistem
        </p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {logs.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-500">
            Belum ada audit log
          </div>
        ) : (
          <>
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {log.action}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {log.createdAt.toISOString()}
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                        {log.actorRole || "-"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="rounded-xl bg-white px-3 py-2">
                        <span className="font-medium text-slate-900">
                          Actor:
                        </span>{" "}
                        {log.actorName || "-"}
                        <div className="mt-1 text-xs text-slate-500">
                          {log.actorEmail || "-"}
                        </div>
                      </div>

                      <div className="rounded-xl bg-white px-3 py-2">
                        <span className="font-medium text-slate-900">
                          Entity:
                        </span>{" "}
                        {log.entityType}
                        {log.entityId ? ` / ${log.entityId}` : ""}
                      </div>

                      <div className="rounded-xl bg-white px-3 py-2">
                        <span className="font-medium text-slate-900">
                          Deskripsi:
                        </span>{" "}
                        {log.description || "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t align-top">
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {log.createdAt.toISOString()}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{log.actorName || "-"}</p>
                          <p className="text-xs text-slate-500">
                            {log.actorEmail || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{log.actorRole || "-"}</td>
                      <td className="px-4 py-3">{log.action}</td>
                      <td className="px-4 py-3">
                        {log.entityType}
                        {log.entityId ? ` / ${log.entityId}` : ""}
                      </td>
                      <td className="px-4 py-3">{log.description || "-"}</td>
                    </tr>
                  ))}

                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        Belum ada audit log
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
