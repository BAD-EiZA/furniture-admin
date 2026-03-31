import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/checkout-schema";
import { generateOrderCode } from "@/lib/order";
import { nanoid } from "nanoid";
import { sendOrderToSalesEmail } from "@/lib/email";

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
      productId,
      quantity,
      salesId,
      customerName,
      customerPhone,
      paymentNote,
      paymentProof,
    } = parsed.data;

    const [product, sales] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
      }),
      prisma.user.findUnique({
        where: { id: salesId },
      }),
    ]);

    if (!product || !product.isActive) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan atau tidak aktif" },
        { status: 404 },
      );
    }

    if (!sales || sales.role !== "SALES" || !sales.isActive) {
      return NextResponse.json(
        { message: "Sales tidak valid" },
        { status: 400 },
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { message: "Stok tidak mencukupi" },
        { status: 400 },
      );
    }

    const subtotal = Number(product.price) * quantity;
    const total = subtotal;
    const orderCode = generateOrderCode();

    const order = await prisma.order.create({
      data: {
        orderCode,
        customerNameDraft: customerName,
        customerPhoneDraft: customerPhone,
        salesId,
        status: "WAITING_CONFIRMATION",
        subtotal,
        total,
        paymentNote: paymentNote || null,
        items: {
          create: {
            productId: product.id,
            quantity,
            price: product.price,
            subtotal,
          },
        },
        paymentProof: {
          create: {
            fileUrl: paymentProof.fileUrl,
            fileKey: paymentProof.fileKey || null,
            mimeType: paymentProof.mimeType || null,
          },
        },
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

    const token = await prisma.emailConfirmationToken.create({
      data: {
        orderId: order.id,
        token: nanoid(48),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      },
    });

    const confirmUrl = `${process.env.APP_URL}/api/orders/confirm?token=${token.token}`;
    const rejectUrl = `${process.env.APP_URL}/api/orders/reject?token=${token.token}`;

    await sendOrderToSalesEmail({
      salesEmail: sales.email,
      salesName: sales.name,
      customerName,
      customerPhone,
      productName: order.items[0].product.name,
      quantity,
      total,
      paymentProofUrl: order.paymentProof!.fileUrl,
      confirmUrl,
      rejectUrl,
      orderCode: order.orderCode,
    });

    return NextResponse.json({
      message: "Order berhasil dibuat dan dikirim ke sales",
      orderCode: order.orderCode,
      status: order.status,
    });
  } catch (error) {
    console.error("CREATE_ORDER_ERROR", error);
    return NextResponse.json(
      { message: "Gagal membuat order" },
      { status: 500 },
    );
  }
}
