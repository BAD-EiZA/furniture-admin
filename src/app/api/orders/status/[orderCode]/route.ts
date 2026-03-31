import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ orderCode: string }> },
) {
  try {
    const { orderCode } = await context.params;

    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: {
        sales: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        paymentProof: true,
        invoice: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET_ORDER_STATUS_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengambil status order" },
      { status: 500 },
    );
  }
}
