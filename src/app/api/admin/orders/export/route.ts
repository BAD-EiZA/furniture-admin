import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

function formatPaymentMethod(method: string) {
  if (method === "TRANSFER") return "Transfer";
  if (method === "COD") return "COD";
  if (method === "TEMPO") return "Tempo";
  return method;
}

function formatAdjustmentType(type: string) {
  if (type === "DISCOUNT") return "Discount";
  if (type === "SURCHARGE") return "Surcharge";
  return "None";
}

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const paymentMethod = searchParams.get("paymentMethod")?.trim() || "";
    const salesId = searchParams.get("salesId")?.trim() || "";
    const hasPo = searchParams.get("hasPo")?.trim() || "";
    const dateFrom = searchParams.get("dateFrom")?.trim() || "";
    const dateTo = searchParams.get("dateTo")?.trim() || "";

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
              {
                customerAddressDraft: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
      ...(status ? { status: status as any } : {}),
      ...(paymentMethod ? { paymentMethod: paymentMethod as any } : {}),
      ...(salesId ? { salesId } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom
                ? { gte: new Date(`${dateFrom}T00:00:00.000Z`) }
                : {}),
              ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
      ...(hasPo === "true"
        ? {
            items: {
              some: {
                poQty: {
                  gt: 0,
                },
              },
            },
          }
        : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        sales: true,
        invoice: true,
        paymentProof: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Orders");

    sheet.columns = [
      { header: "Order Code", key: "orderCode", width: 22 },
      { header: "Tanggal Order", key: "createdAt", width: 24 },
      { header: "Status", key: "status", width: 20 },

      { header: "Customer", key: "customerName", width: 24 },
      { header: "No HP", key: "customerPhone", width: 18 },
      { header: "Alamat", key: "customerAddress", width: 35 },
      { header: "Kecamatan", key: "customerDistrict", width: 20 },
      { header: "Kota", key: "customerCity", width: 16 },

      { header: "Sales", key: "salesName", width: 22 },
      { header: "Payment Method", key: "paymentMethod", width: 18 },
      { header: "Shipping / Item", key: "shippingCostPerItem", width: 16 },
      { header: "Discount %", key: "discountPercent", width: 14 },

      { header: "Product", key: "productName", width: 28 },
      { header: "Tier Harga", key: "priceTierLabel", width: 18 },
      { header: "Qty", key: "quantity", width: 10 },
      { header: "Ready Qty", key: "readyQty", width: 12 },
      { header: "PO Qty", key: "poQty", width: 10 },
      { header: "Harga Satuan", key: "unitPrice", width: 18 },
      { header: "Subtotal Item", key: "itemSubtotal", width: 18 },

      { header: "Order Subtotal", key: "orderSubtotal", width: 18 },
      { header: "Shipping Total", key: "orderShipping", width: 18 },
      { header: "Adjustment Type", key: "adjustmentType", width: 18 },
      { header: "Adjustment Value", key: "adjustmentValue", width: 18 },
      { header: "Order Total", key: "orderTotal", width: 18 },

      { header: "Invoice Number", key: "invoiceNumber", width: 22 },
      { header: "Bukti Pembayaran", key: "paymentProof", width: 40 },
    ];

    for (const order of orders) {
      if (order.items.length === 0) {
        sheet.addRow({
          orderCode: order.orderCode,
          createdAt: order.createdAt.toISOString(),
          status: order.status,
          customerName: order.customerNameDraft,
          customerPhone: order.customerPhoneDraft,
          customerAddress: order.customerAddressDraft,
          salesName: order.sales.name,
          paymentMethod: formatPaymentMethod(order.paymentMethod),
          productName: "",
          priceTierLabel: "",
          quantity: 0,
          readyQty: 0,
          poQty: 0,
          unitPrice: 0,
          itemSubtotal: 0,
          orderSubtotal: Number(order.subtotal),
          customerDistrict: order.customerDistrictDraft,
          customerCity: order.customerCityDraft,
          shippingCostPerItem: 0,
          discountPercent: 0,
          orderShipping: Number(order.shippingCost || 0),
          adjustmentType: formatAdjustmentType(order.adjustmentType),
          adjustmentValue: Number(order.adjustmentValue),
          orderTotal: Number(order.total),
          invoiceNumber: order.invoice?.invoiceNumber || "",
          paymentProof: order.paymentProof?.fileUrl || "",
        });
        continue;
      }

      for (const item of order.items) {
        sheet.addRow({
          orderCode: order.orderCode,
          createdAt: order.createdAt.toISOString(),
          status: order.status,

          customerName: order.customerNameDraft,
          customerPhone: order.customerPhoneDraft,
          customerAddress: order.customerAddressDraft,

          salesName: order.sales.name,
          customerDistrict: order.customerDistrictDraft,
          customerCity: order.customerCityDraft,
          shippingCostPerItem: Number(item.shippingCostPerItem || 0),
          discountPercent: Number(item.discountPercent || 0) * 100,
          orderShipping: Number(order.shippingCost || 0),
          paymentMethod: formatPaymentMethod(order.paymentMethod),

          productName: item.product.name,
          priceTierLabel: item.priceTierLabel || "",
          quantity: item.quantity,
          readyQty: item.readyQty,
          poQty: item.poQty,
          unitPrice: Number(item.unitPrice),
          itemSubtotal: Number(item.subtotal),

          orderSubtotal: Number(order.subtotal),
          adjustmentType: formatAdjustmentType(order.adjustmentType),
          adjustmentValue: Number(order.adjustmentValue),
          orderTotal: Number(order.total),

          invoiceNumber: order.invoice?.invoiceNumber || "",
          paymentProof: order.paymentProof?.fileUrl || "",
        });
      }
    }

    // Styling
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0F172A" },
    };
    headerRow.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    sheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: "middle", wrapText: true };

      if (rowNumber > 1) {
        const statusCell = row.getCell("status");

        if (statusCell.value === "CONFIRMED") {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "DCFCE7" },
          };
        } else if (statusCell.value === "REJECTED") {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FEE2E2" },
          };
        } else if (statusCell.value === "WAITING_CONFIRMATION") {
          statusCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FEF3C7" },
          };
        }
      }
    });

    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = {
      from: "A1",
      to: "Y1",
    };

    const buffer = await workbook.xlsx.writeBuffer();

    await writeAuditLog({
      action: "EXPORT_ORDERS",
      entityType: "ORDER",
      description: `Export order ke Excel dengan filter lanjutan`,
      afterData: {
        totalOrders: orders.length,
        q,
        status,
        paymentMethod,
        salesId,
        hasPo,
        dateFrom,
        dateTo,
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
