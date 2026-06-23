import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { addOrderTimeline } from "@/lib/order-timeline";
import { deleteCache, deleteCacheByPattern } from "@/lib/cache";
import { getSession } from "@/lib/auth";

async function markOrderUnshipped(orderId: string) {
  const session = await getSession().catch(() => null);

  if (!session) {
    return {
      ok: false as const,
      status: 401,
      message: "Unauthorized",
    };
  }

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.role);

  if (!isAdmin) {
    return {
      ok: false as const,
      status: 403,
      message: "Hanya admin yang dapat membatalkan pengiriman pesanan",
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return {
      ok: false as const,
      status: 404,
      message: "Pesanan tidak ditemukan",
    };
  }

  if (order.status !== "SHIPPED") {
    return {
      ok: false as const,
      status: 400,
      message: "Hanya pesanan dengan status Dikirim yang bisa dibatalkan pengirimannya",
    };
  }

  // Kembalikan ke INVOICE_SENT jika sudah ada invoiceSentAt, atau CONFIRMED jika belum
  const rollbackStatus = order.invoiceSentAt ? "INVOICE_SENT" : "CONFIRMED";

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: rollbackStatus,
      shippedAt: null,
    },
  });

  await addOrderTimeline({
    orderId: order.id,
    title: "Pengiriman dibatalkan",
    description: `Pengiriman pesanan ${order.orderCode} dibatalkan, status kembali ke ${rollbackStatus === "INVOICE_SENT" ? "Invoice Terkirim" : "Terkonfirmasi"}`,
  });

  await writeAuditLog({
    action: "UPDATE",
    entityType: "ORDER",
    entityId: order.id,
    description: `Membatalkan pengiriman pesanan ${order.orderCode}`,
    beforeData: {
      status: order.status,
      shippedAt: order.shippedAt,
    },
    afterData: {
      status: updated.status,
      shippedAt: null,
    },
  });

  return {
    ok: true as const,
    orderCode: order.orderCode,
  };
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let orderId = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      orderId = body.orderId || "";
    } else {
      const formData = await req.formData();
      orderId = String(formData.get("orderId") || "");
    }

    if (!orderId) {
      return NextResponse.json(
        { message: "orderId wajib diisi" },
        { status: 400 },
      );
    }

    const result = await markOrderUnshipped(orderId);

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status },
      );
    }

    await deleteCache("admin:dashboard:summary");
    await deleteCache("admin:analytics:summary");
    await deleteCacheByPattern("sales:dashboard:*");

    return NextResponse.json({
      message: "Pengiriman berhasil dibatalkan",
      orderCode: result.orderCode,
    });
  } catch (error) {
    console.error("MARK_ORDER_UNSHIPPED_ERROR", error);
    return NextResponse.json(
      { message: "Gagal membatalkan pengiriman" },
      { status: 500 },
    );
  }
}
