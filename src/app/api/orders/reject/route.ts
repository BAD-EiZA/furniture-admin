import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenValue = searchParams.get("token");

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
      return new NextResponse("Token sudah digunakan", { status: 400 });
    }

    if (token.expiresAt < new Date()) {
      return new NextResponse("Token sudah kedaluwarsa", { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: token.orderId },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
        },
      });

      await tx.emailConfirmationToken.update({
        where: { id: token.id },
        data: {
          usedAt: new Date(),
        },
      });
    });
    await writeAuditLog({
      action: "REJECT_PAYMENT",
      entityType: "ORDER",
      entityId: token.orderId,
      description: `Menolak pembayaran order ${token.order.orderCode}`,
      afterData: {
        orderCode: token.order.orderCode,
        status: "REJECTED",
      },
    });

    return NextResponse.redirect(
      `${process.env.APP_URL}/status/${token.order.orderCode}`,
    );
  } catch (error) {
    console.error("REJECT_ORDER_ERROR", error);
    return new NextResponse("Gagal menolak order", { status: 500 });
  }
}
