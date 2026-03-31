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

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
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
      </div>
    </div>
  );
}
