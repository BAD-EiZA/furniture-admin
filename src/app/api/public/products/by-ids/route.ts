import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const idsParam = searchParams.get("ids") || "";

        const ids = idsParam
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

        if (ids.length === 0) {
            return NextResponse.json({ products: [] });
        }

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
            },
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error("GET_PRODUCTS_BY_IDS_ERROR", error);

        return NextResponse.json(
            { message: "Gagal mengambil data produk" },
            { status: 500 }
        );
    }
}