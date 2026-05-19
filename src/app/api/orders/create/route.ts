import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/checkout-schema";
import {
  getPaymentAdjustment,
  getShippingCostPerItem,
  splitReadyAndPO,
} from "@/lib/checkout-pricing";

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
      deliveryAreaType,
      paymentMethod,
      paymentNote,
      paymentProof,
      acceptPoItems,
    } = parsed.data;

    const productIds = items.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        tierPrices: {
          orderBy: { minQty: "desc" },
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

      const shippingPerItem = getShippingCostPerItem({
        deliveryAreaType,
        productShippingFee: Number(product.shippingFee || 0),
      });

      // Gunakan tierPrices dari admin produk (sama dengan yang ditampilkan di frontend)
      const matchedTier = product.tierPrices?.find(
        (tier) => inputItem.quantity >= tier.minQty,
      );

      const discountedUnitPrice = matchedTier
        ? Number(matchedTier.price)
        : Number(product.price);

      const discountPercent = matchedTier
        ? Math.max(0, (Number(product.price) - Number(matchedTier.price)) / Number(product.price))
        : 0;

      const discountLabel = matchedTier
        ? matchedTier.label || `Min ${matchedTier.minQty} pcs`
        : "Retail";

      // itemSubtotal = harga saja (tanpa ongkir) agar tidak double-count
      const itemSubtotal = discountedUnitPrice * inputItem.quantity;
      const itemShippingTotal = shippingPerItem * inputItem.quantity;

      subtotal += itemSubtotal;
      shippingCostTotal += itemShippingTotal;

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

    // Grand total: subtotal (harga saja) + ongkir, baru hitung diskon/surcharge metode bayar
    const subtotalWithShipping = subtotal + shippingCostTotal;
    const adjustment = getPaymentAdjustment(
      subtotalWithShipping,
      paymentMethod as "TRANSFER" | "COD" | "TEMPO",
    );

    const orderCode = `ORD-${nanoid(10).toUpperCase()}`;

    const createdOrder = await prisma.order.create({
      data: {
        orderCode,
        customerNameDraft: customerName,
        customerPhoneDraft: customerPhone,
        customerAddressDraft: customerAddress,
        customerDistrictDraft: customerDistrict,
        customerCityDraft: customerCity,
        deliveryAreaType,
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
        total: adjustment.total, // subtotal + ongkir + diskon/surcharge metode bayar
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
        timelines: {
          create: {
            title: "Pesanan dibuat",
            description: "Pesanan berhasil dibuat oleh customer",
          },
        },
      },
    });

    return NextResponse.json({
      message: "Pesanan berhasil dibuat",
      orderId: createdOrder.id,
      orderCode: createdOrder.orderCode,
    });
  } catch (error) {
    console.error("CREATE_ORDER_ERROR", error);
    return NextResponse.json(
      { message: "Gagal membuat order" },
      { status: 500 },
    );
  }
}
