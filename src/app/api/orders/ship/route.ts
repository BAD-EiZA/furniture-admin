import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { addOrderTimeline } from "@/lib/order-timeline";
import { deleteCache, deleteCacheByPattern } from "@/lib/cache";
import { getSession } from "@/lib/auth";

async function markOrderShipped(orderId: string) {
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
      message: "Hanya admin yang dapat menandai pesanan sebagai dikirim",
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

  if (order.status === "SHIPPED") {
    return {
      ok: true as const,
      alreadyShipped: true,
      orderCode: order.orderCode,
    };
  }

  if (!["CONFIRMED", "INVOICE_SENT"].includes(order.status)) {
    return {
      ok: false as const,
      status: 400,
      message:
        "Hanya pesanan yang sudah dikonfirmasi atau invoice dikirim yang bisa ditandai dikirim",
    };
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "SHIPPED",
      shippedAt: new Date(),
    },
  });

  await addOrderTimeline({
    orderId: order.id,
    title: "Pesanan dikirim",
    description: `Pesanan ${order.orderCode} telah dikirim ke customer`,
  });

  await writeAuditLog({
    action: "UPDATE",
    entityType: "ORDER",
    entityId: order.id,
    description: `Menandai pesanan ${order.orderCode} sebagai dikirim`,
    beforeData: {
      status: order.status,
      shippedAt: order.shippedAt,
    },
    afterData: {
      status: updated.status,
      shippedAt: updated.shippedAt,
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

    const result = await markOrderShipped(orderId);

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
      message: "Pesanan berhasil ditandai dikirim",
      orderCode: result.orderCode,
    });
  } catch (error) {
    console.error("MARK_ORDER_SHIPPED_ERROR", error);
    return NextResponse.json(
      { message: "Gagal menandai pesanan sebagai dikirim" },
      { status: 500 },
    );
  }
}
