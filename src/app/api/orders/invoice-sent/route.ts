import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { addOrderTimeline } from "@/lib/order-timeline";

async function markInvoiceSent(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
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

    if (!order.invoice) {
        return {
            ok: false as const,
            status: 400,
            message: "Invoice belum tersedia",
        };
    }

    if (!["CONFIRMED", "INVOICE_SENT"].includes(order.status)) {
        return {
            ok: false as const,
            status: 400,
            message: "Order belum bisa ditandai invoice sent",
        };
    }

    if (order.status === "INVOICE_SENT") {
        return {
            ok: true as const,
            alreadyUpdated: true,
            orderCode: order.orderCode,
        };
    }

    const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
            status: "INVOICE_SENT",
            invoiceSentAt: new Date(),
        },
    });

    await addOrderTimeline({
        orderId: order.id,
        title: "Invoice dikirim",
        description: `Invoice untuk order ${order.orderCode} telah dikirim ke customer`,
    });

    await writeAuditLog({
        action: "UPDATE",
        entityType: "ORDER",
        entityId: order.id,
        description: `Menandai invoice sent untuk order ${order.orderCode}`,
        beforeData: {
            status: order.status,
            invoiceSentAt: order.invoiceSentAt,
        },
        afterData: {
            status: updated.status,
            invoiceSentAt: updated.invoiceSentAt,
        },
    });

    return {
        ok: true as const,
        orderCode: order.orderCode,
    };
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
                { status: 400 }
            );
        }

        const result = await markInvoiceSent(orderId);

        if (!result.ok) {
            return NextResponse.json(
                { message: result.message },
                { status: result.status }
            );
        }

        return NextResponse.json({
            message: "Order berhasil ditandai invoice sent",
            orderCode: result.orderCode,
        });
    } catch (error) {
        console.error("MARK_INVOICE_SENT_ERROR", error);

        return NextResponse.json(
            { message: "Gagal menandai invoice sent" },
            { status: 500 }
        );
    }
}