import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { addOrderTimeline } from "@/lib/order-timeline";
import { deleteCache, deleteCacheByPattern } from "@/lib/cache";
import { getSession } from "@/lib/auth";

async function rejectOrderByOrderId(params: {
  orderId: string;
  tokenId?: string;
  reason?: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      invoice: true,
    },
  });

  if (!order) {
    return {
      ok: false as const,
      status: 404,
      message: "Order tidak ditemukan",
    };
  }

  const session = await getSession().catch(() => null);

  if (!session) {
    return {
      ok: false as const,
      status: 401,
      message: "Unauthorized",
    };
  }

  const isSales = session.role === "SALES";
  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.role);

  if (!isAdmin && !(isSales && order.salesId === session.userId)) {
    return {
      ok: false as const,
      status: 403,
      message: "Anda tidak memiliki akses untuk menolak order ini",
    };
  }

  if (order.status === "REJECTED") {
    return {
      ok: true as const,
      alreadyRejected: true,
      orderCode: order.orderCode,
    };
  }

  if (order.status === "CONFIRMED" || order.status === "INVOICE_SENT") {
    return {
      ok: false as const,
      status: 400,
      message: "Order yang sudah dikonfirmasi tidak bisa ditolak",
    };
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        internalNote: params.reason
          ? order.internalNote
            ? `${order.internalNote}\n\nAlasan reject: ${params.reason}`
            : `Alasan reject: ${params.reason}`
          : order.internalNote,
      },
    });

    if (params.tokenId) {
      await tx.emailConfirmationToken.update({
        where: { id: params.tokenId },
        data: {
          usedAt: new Date(),
        },
      });
    }

    return updated;
  });

  await addOrderTimeline({
    orderId: order.id,
    title: "Pembayaran ditolak",
    description: params.reason
      ? `Order ${order.orderCode} ditolak. Alasan: ${params.reason}`
      : `Order ${order.orderCode} ditolak`,
  });

  await writeAuditLog({
    action: "REJECT_PAYMENT",
    entityType: "ORDER",
    entityId: order.id,
    description: `Menolak pembayaran order ${order.orderCode}`,
    beforeData: {
      status: order.status,
      rejectedAt: order.rejectedAt,
      internalNote: order.internalNote,
    },
    afterData: {
      status: updatedOrder.status,
      rejectedAt: updatedOrder.rejectedAt,
      internalNote: updatedOrder.internalNote,
    },
  });

  await deleteCache("admin:dashboard:summary");
  await deleteCache("admin:analytics:summary");
  await deleteCacheByPattern("sales:dashboard:*");

  return {
    ok: true as const,
    orderCode: order.orderCode,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenValue = searchParams.get("token");
    const reason = searchParams.get("reason") || "";

    if (!tokenValue) {
      return new NextResponse("Token tidak ditemukan", { status: 400 });
    }

    const token = await prisma.emailConfirmationToken.findUnique({
      where: { token: tokenValue },
      include: {
        order: true,
      },
    });

    if (!token) {
      return new NextResponse("Token tidak valid", { status: 404 });
    }

    if (token.usedAt) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/status/${token.order.orderCode}`,
      );
    }

    if (token.expiresAt < new Date()) {
      return new NextResponse("Token sudah kedaluwarsa", { status: 400 });
    }

    const result = await rejectOrderByOrderId({
      orderId: token.orderId,
      tokenId: token.id,
      reason,
    });

    if (!result.ok) {
      return new NextResponse(result.message, { status: result.status });
    }

    return NextResponse.redirect(
      `${process.env.APP_URL}/status/${result.orderCode}`,
    );
  } catch (error) {
    console.error("REJECT_ORDER_GET_ERROR", error);

    const message =
      error instanceof Error ? error.message : "Gagal menolak order";

    return new NextResponse(message, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let orderId = "";
    let reason = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      orderId = body.orderId || "";
      reason = body.reason || "";
    } else {
      const formData = await req.formData();
      orderId = String(formData.get("orderId") || "");
      reason = String(formData.get("reason") || "");
    }

    if (!orderId) {
      return NextResponse.json(
        { message: "orderId wajib diisi" },
        { status: 400 },
      );
    }

    const result = await rejectOrderByOrderId({ orderId, reason });

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json({
      message: "Order berhasil ditolak",
      orderCode: result.orderCode,
    });
  } catch (error) {
    console.error("REJECT_ORDER_POST_ERROR", error);

    const message =
      error instanceof Error ? error.message : "Gagal menolak order";

    return NextResponse.json({ message }, { status: 500 });
  }
}
