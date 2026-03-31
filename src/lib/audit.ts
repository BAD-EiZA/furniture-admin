import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type WriteAuditLogParams = {
  action:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "CONFIRM_PAYMENT"
    | "REJECT_PAYMENT"
    | "EXPORT_ORDERS"
    | "DOWNLOAD_INVOICE";
  entityType: string;
  entityId?: string | null;
  description?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
};

export async function writeAuditLog(params: WriteAuditLogParams) {
  const session = await getSession().catch(() => null);

  await prisma.auditLog.create({
    data: {
      actorId: session?.userId ?? null,
      actorName: session?.name ?? null,
      actorEmail: session?.email ?? null,
      actorRole: session?.role ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      description: params.description ?? null,
      beforeData: params.beforeData as any,
      afterData: params.afterData as any,
    },
  });
}
