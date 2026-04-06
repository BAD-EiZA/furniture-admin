import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/order";
import { writeAuditLog } from "@/lib/audit";
import { addOrderTimeline } from "@/lib/order-timeline";
import { createStockHistory } from "@/lib/stock-history";
import { deleteCache, deleteCacheByPattern } from "@/lib/cache";

async function confirmOrderByOrderId(params: {
  orderId: string;
  tokenId?: string;
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
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

  if (order.status === "CONFIRMED") {
    return {
      ok: true as const,
      alreadyConfirmed: true,
      orderCode: order.orderCode,
    };
  }

  if (order.status === "REJECTED") {
    return {
      ok: false as const,
      status: 400,
      message: "Order sudah ditolak dan tidak bisa dikonfirmasi",
    };
  }

  for (const item of order.items) {
    if (item.readyQty > item.product.readyStock) {
      return {
        ok: false as const,
        status: 400,
        message: `Ready stock ${item.product.name} tidak mencukupi saat konfirmasi`,
      };
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.create({
      data: {
        name: order.customerNameDraft,
        phone: order.customerPhoneDraft,
      },
    });

    const updatedProductsForHistory: {
      productId: string;
      productName: string;
      stockBefore: number;
      stockAfter: number;
      readyBefore: number;
      readyAfter: number;
      readyQty: number;
    }[] = [];

    for (const item of order.items) {
      if (item.readyQty > 0) {
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: {
            readyStock: {
              decrement: item.readyQty,
            },
            stock: {
              decrement: item.readyQty,
            },
          },
        });

        updatedProductsForHistory.push({
          productId: item.productId,
          productName: item.product.name,
          stockBefore: item.product.stock,
          stockAfter: updatedProduct.stock,
          readyBefore: item.product.readyStock,
          readyAfter: updatedProduct.readyStock,
          readyQty: item.readyQty,
        });
      }
    }

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        customerId: customer.id,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });

    let invoice = order.invoice;

    if (!invoice) {
      invoice = await tx.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber: generateInvoiceNumber(),
        },
      });
    }

    if (params.tokenId) {
      await tx.emailConfirmationToken.update({
        where: { id: params.tokenId },
        data: {
          usedAt: new Date(),
        },
      });
    }

    for (const productHistory of updatedProductsForHistory) {
      await createStockHistory({
        productId: productHistory.productId,
        type: "ORDER_CONFIRMATION",
        stockBefore: productHistory.stockBefore,
        stockAfter: productHistory.stockAfter,
        readyBefore: productHistory.readyBefore,
        readyAfter: productHistory.readyAfter,
        changeAmount: -productHistory.readyQty,
        orderId: order.id,
        note: `Pengurangan stok karena konfirmasi order ${order.orderCode}`,
      });
    }

    return {
      updatedOrder,
      invoice,
    };
  });

  await addOrderTimeline({
    orderId: order.id,
    title: "Pembayaran dikonfirmasi",
    description: `Order ${order.orderCode} berhasil dikonfirmasi`,
  });

  await writeAuditLog({
    action: "CONFIRM_PAYMENT",
    entityType: "ORDER",
    entityId: order.id,
    description: `Konfirmasi pembayaran order ${order.orderCode}`,
    afterData: {
      orderCode: order.orderCode,
      status: "CONFIRMED",
      invoiceNumber: result.invoice?.invoiceNumber || null,
    },
  });

  return {
    ok: true as const,
    orderCode: order.orderCode,
  };
}

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
      return NextResponse.redirect(
        `${process.env.APP_URL}/status/${token.order.orderCode}`,
      );
    }

    if (token.expiresAt < new Date()) {
      return new NextResponse("Token sudah kedaluwarsa", { status: 400 });
    }

    const result = await confirmOrderByOrderId({
      orderId: token.orderId,
      tokenId: token.id,
    });

    if (!result.ok) {
      return new NextResponse(result.message, { status: result.status });
    }

    return NextResponse.redirect(
      `${process.env.APP_URL}/status/${result.orderCode}`,
    );
  } catch (error) {
    console.error("CONFIRM_ORDER_GET_ERROR", error);
    return new NextResponse("Gagal mengonfirmasi order", { status: 500 });
  }
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

    const result = await confirmOrderByOrderId({ orderId });

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status },
      );
    }

    await deleteCache("admin:dashboard:summary");
    await deleteCache("admin:analytics:summary");
    await deleteCacheByPattern("catalog:*");
    await deleteCacheByPattern("product:detail:*");
    await deleteCacheByPattern("customers:*");
    await deleteCacheByPattern("sales:dashboard:*");
    await deleteCacheByPattern("stock-history:*");

    return NextResponse.json({
      message: "Order berhasil dikonfirmasi",
      orderCode: result.orderCode,
    });
  } catch (error) {
    console.error("CONFIRM_ORDER_POST_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengonfirmasi order" },
      { status: 500 },
    );
  }
}
