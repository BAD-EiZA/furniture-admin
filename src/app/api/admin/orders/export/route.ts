import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const where = {
      ...(q
        ? {
            OR: [
              { orderCode: { contains: q, mode: "insensitive" as const } },
              {
                customerNameDraft: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
              {
                customerPhoneDraft: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
      ...(status
        ? {
            status: status as
              | "PENDING_PAYMENT"
              | "WAITING_CONFIRMATION"
              | "CONFIRMED"
              | "REJECTED"
              | "CANCELLED",
          }
        : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        sales: true,
        items: {
          include: {
            product: true,
          },
        },
        invoice: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Orders");

    sheet.columns = [
      { header: "Order Code", key: "orderCode", width: 20 },
      { header: "Tanggal", key: "createdAt", width: 22 },
      { header: "Customer", key: "customerName", width: 24 },
      { header: "No HP", key: "customerPhone", width: 18 },
      { header: "Produk", key: "productName", width: 28 },
      { header: "Quantity", key: "quantity", width: 12 },
      { header: "Sales", key: "salesName", width: 20 },
      { header: "Total", key: "total", width: 18 },
      { header: "Status", key: "status", width: 20 },
      { header: "Invoice", key: "invoiceNumber", width: 22 },
    ];

    orders.forEach((order) => {
      const item = order.items[0];
      sheet.addRow({
        orderCode: order.orderCode,
        createdAt: order.createdAt.toISOString(),
        customerName: order.customerNameDraft,
        customerPhone: order.customerPhoneDraft,
        productName: item?.product.name || "",
        quantity: item?.quantity || 0,
        salesName: order.sales.name,
        total: Number(order.total),
        status: order.status,
        invoiceNumber: order.invoice?.invoiceNumber || "",
      });
    });

    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();

    await writeAuditLog({
      action: "EXPORT_ORDERS",
      entityType: "ORDER",
      description: `Export order ke Excel. Filter q="${q}", status="${status}"`,
      afterData: {
        totalRows: orders.length,
        q,
        status,
      },
    });

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="orders-export.xlsx"`,
      },
    });
  } catch (error) {
    console.error("EXPORT_ORDERS_ERROR", error);
    return NextResponse.json(
      { message: "Gagal export order" },
      { status: 500 },
    );
  }
}
