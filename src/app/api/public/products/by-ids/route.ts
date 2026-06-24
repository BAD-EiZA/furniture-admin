import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const idsParam = req.nextUrl.searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ products: [] });
    }

    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
        isActive: true,
      },
      include: {
        medias: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        tierPrices: {
          orderBy: { minQty: "asc" },
        },
        bonusRules: {
          orderBy: { minQty: "asc" },
          include: {
            bonusProduct: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET_PRODUCTS_BY_IDS_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengambil produk" },
      { status: 500 },
    );
  }
}
