import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/order";
import { writeAuditLog } from "@/lib/audit";
import { addOrderTimeline } from "@/lib/order-timeline";

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
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
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

    const order = token.order;

    if (order.status === "CONFIRMED") {
      return NextResponse.redirect(
        `${process.env.APP_URL}/status/${order.orderCode}`,
      );
    }

    const item = order.items[0];
    if (!item) {
      return new NextResponse("Item order tidak ditemukan", { status: 400 });
    }

    if (item.product.stock < item.quantity) {
      return new NextResponse("Stok tidak mencukupi saat konfirmasi", {
        status: 400,
      });
    }

    await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          name: order.customerNameDraft,
          phone: order.customerPhoneDraft,
        },
      });

      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          customerId: customer.id,
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });

      await tx.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber: generateInvoiceNumber(),
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
      action: "CONFIRM_PAYMENT",
      entityType: "ORDER",
      entityId: order.id,
      description: `Konfirmasi pembayaran order ${order.orderCode}`,
      afterData: {
        orderCode: order.orderCode,
        status: "CONFIRMED",
      },
    });

    await addOrderTimeline({
      orderId: order.id,
      title: "Pembayaran dikonfirmasi",
      description: `Order ${order.orderCode} berhasil dikonfirmasi`,
    });

    return NextResponse.redirect(
      `${process.env.APP_URL}/status/${order.orderCode}`,
    );
  } catch (error) {
    console.error("CONFIRM_ORDER_ERROR", error);
    return new NextResponse("Gagal mengonfirmasi order", { status: 500 });
  }
}
