import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/checkout-schema";
import { generateOrderCode } from "@/lib/order";
import {
  getPaymentAdjustment,
  getShippingCostPerItem,
  getUnitPriceAfterBulkDiscount,
  splitReadyAndPO,
} from "@/lib/checkout-pricing";
import { sendOrderToSalesEmail } from "@/lib/email";
import { addOrderTimeline } from "@/lib/order-timeline";
import { deleteCache, deleteCacheByPattern } from "@/lib/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data checkout tidak valid",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      items,
      salesId,
      customerName,
      customerPhone,
      customerAddress,
      customerDistrict,
      customerCity,
      paymentMethod,
      paymentNote,
      paymentProof,
      acceptPoItems,
    } = parsed.data;

    if (paymentMethod === "TRANSFER" && !paymentProof) {
      return NextResponse.json(
        { message: "Bukti pembayaran wajib untuk metode transfer" },
        { status: 400 },
      );
    }

    const sales = await prisma.user.findUnique({
      where: { id: salesId },
    });

    if (!sales || sales.role !== "SALES" || !sales.isActive) {
      return NextResponse.json(
        { message: "Sales tidak valid" },
        { status: 400 },
      );
    }

    const productIds = items.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        tierPrices: {
          orderBy: { minQty: "asc" },
        },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { message: "Ada produk yang tidak ditemukan" },
        { status: 400 },
      );
    }

    const orderItemsData: {
      productId: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      shippingCostPerItem: number;
      discountPercent: number;
      readyQty: number;
      poQty: number;
      priceTierLabel: string;
    }[] = [];

    let subtotal = 0;
    let shippingCostTotal = 0;
    let hasPoItems = false;

    for (const inputItem of items) {
      const product = products.find((p) => p.id === inputItem.productId);

      if (!product || !product.isActive) {
        return NextResponse.json(
          { message: "Produk tidak valid atau tidak aktif" },
          { status: 400 },
        );
      }

      const split = splitReadyAndPO(inputItem.quantity, product.readyStock);

      if (split.poQty > 0) {
        hasPoItems = true;
      }

      if (split.poQty > 0 && !product.allowPreOrder) {
        return NextResponse.json(
          { message: `${product.name} tidak mendukung pre-order` },
          { status: 400 },
        );
      }

      const shippingPerItem = getShippingCostPerItem(customerCity);

      const { discountPercent, discountedUnitPrice, discountLabel } =
        getUnitPriceAfterBulkDiscount(
          Number(product.price),
          inputItem.quantity,
          product.pcsPerBal || 24,
        );

      const itemSubtotal =
        (discountedUnitPrice + shippingPerItem) * inputItem.quantity;

      subtotal += itemSubtotal;
      shippingCostTotal += shippingPerItem * inputItem.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: inputItem.quantity,
        unitPrice: discountedUnitPrice,
        subtotal: itemSubtotal,
        shippingCostPerItem: shippingPerItem,
        discountPercent,
        readyQty: split.readyQty,
        poQty: split.poQty,
        priceTierLabel: discountLabel,
      });
    }

    if (hasPoItems && !acceptPoItems) {
      return NextResponse.json(
        {
          message:
            "Terdapat item yang masuk kategori pre-order. Silakan konfirmasi terlebih dahulu untuk melanjutkan checkout.",
          hasPoItems: true,
        },
        { status: 400 },
      );
    }

    const adjustment = getPaymentAdjustment(subtotal, paymentMethod);
    const orderCode = generateOrderCode();

    const order = await prisma.order.create({
      data: {
        orderCode,
        customerNameDraft: customerName,
        customerPhoneDraft: customerPhone,
        customerAddressDraft: customerAddress,
        customerDistrictDraft: customerDistrict,
        customerCityDraft: customerCity,
        salesId,
        status:
          paymentMethod === "TRANSFER"
            ? "WAITING_CONFIRMATION"
            : "PENDING_PAYMENT",
        paymentMethod,
        adjustmentType: adjustment.adjustmentType,
        adjustmentValue: adjustment.adjustmentValue,
        shippingCost: shippingCostTotal,
        subtotal,
        total: adjustment.total,
        paymentNote: paymentNote || null,
        items: {
          create: orderItemsData,
        },
        ...(paymentProof
          ? {
              paymentProof: {
                create: {
                  fileUrl: paymentProof.fileUrl,
                  fileKey: paymentProof.fileKey || null,
                  mimeType: paymentProof.mimeType || null,
                },
              },
            }
          : {}),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        paymentProof: true,
      },
    });

    await addOrderTimeline({
      orderId: order.id,
      title: "Order dibuat",
      description: `Order ${order.orderCode} berhasil dibuat`,
    });

    if (paymentProof) {
      await addOrderTimeline({
        orderId: order.id,
        title: "Bukti pembayaran diunggah",
        description: "Customer telah mengunggah bukti pembayaran",
      });
    }

    const token = await prisma.emailConfirmationToken.create({
      data: {
        orderId: order.id,
        token: nanoid(48),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      },
    });

    const confirmUrl = `${process.env.APP_URL}/api/orders/confirm?token=${token.token}`;
    const rejectUrl = `${process.env.APP_URL}/api/orders/reject?token=${token.token}`;

    if (paymentMethod === "TRANSFER") {
      await sendOrderToSalesEmail({
        salesEmail: sales.email,
        salesName: sales.name,
        customerName,
        customerPhone,
        productName: `${order.items.length} item`,
        quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        total: Number(order.total),
        paymentProofUrl: order.paymentProof?.fileUrl || "",
        confirmUrl,
        rejectUrl,
        orderCode: order.orderCode,
      });
    }

    await deleteCache("admin:dashboard:summary");
    await deleteCache("admin:analytics:summary");
    await deleteCacheByPattern("catalog:*");
    await deleteCacheByPattern("product:detail:*");

    return NextResponse.json({
      message: "Order berhasil dibuat",
      orderCode: order.orderCode,
      status: order.status,
      paymentMethod,
      total: Number(order.total),
    });
  } catch (error) {
    console.error("CREATE_ORDER_ERROR", error);

    return NextResponse.json(
      { message: "Gagal membuat order" },
      { status: 500 },
    );
  }
}
