import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type CreateStockHistoryParams = {
    productId: string;
    type: "MANUAL_UPDATE" | "ORDER_CONFIRMATION" | "PRODUCT_CREATE";
    stockBefore: number;
    stockAfter: number;
    readyBefore: number;
    readyAfter: number;
    changeAmount: number;
    note?: string;
    orderId?: string;
};

export async function createStockHistory(params: CreateStockHistoryParams) {
    const session = await getSession().catch(() => null);

    await prisma.stockHistory.create({
        data: {
            productId: params.productId,
            type: params.type,
            stockBefore: params.stockBefore,
            stockAfter: params.stockAfter,
            readyBefore: params.readyBefore,
            readyAfter: params.readyAfter,
            changeAmount: params.changeAmount,
            note: params.note || null,
            orderId: params.orderId || null,

            actorId: session?.userId || null,
            actorName: session?.name || null,
            actorRole: session?.role || null,
        },
    });
}