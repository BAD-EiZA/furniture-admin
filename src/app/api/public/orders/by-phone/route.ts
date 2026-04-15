import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone")?.trim() || "";

    if (!phone) {
      return NextResponse.json({ orders: [] });
    }

    const normalizedPhone = normalizePhone(phone);

    const orders = await prisma.order.findMany({
      where: {
        customerPhoneDraft: {
          contains: normalizedPhone,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        orderCode: true,
        status: true,
        total: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("PUBLIC_ORDERS_BY_PHONE_ERROR", error);
    return NextResponse.json(
      { message: "Gagal memuat pesanan" },
      { status: 500 },
    );
  }
}
