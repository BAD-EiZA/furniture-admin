import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

function formatPaymentMethod(method: string) {
  if (method === "TRANSFER") return "Transfer / Bayar di Muka";
  if (method === "COD") return "COD";
  if (method === "TEMPO") return "Tempo";
  return method;
}

function formatAdjustmentLabel(type: string) {
  if (type === "DISCOUNT") return "Potongan Pembayaran";
  if (type === "SURCHARGE") return "Biaya Tambahan";
  return "Penyesuaian";
}

function formatDeliveryAreaType(type: string) {
  if (type === "DALAM_KOTA") return "Dalam Kota";
  if (type === "LUAR_KOTA") return "Luar Kota";
  return type;
}

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sales: true,
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
    { header: "Order Code", key: "orderCode", width: 18 },
    { header: "Tanggal", key: "createdAt", width: 20 },
    { header: "Status", key: "status", width: 20 },

    { header: "Customer", key: "customerName", width: 24 },
    { header: "Phone", key: "customerPhone", width: 18 },
    { header: "Alamat", key: "customerAddress", width: 34 },
    { header: "Kecamatan", key: "customerDistrict", width: 18 },
    { header: "Kota", key: "customerCity", width: 18 },
    { header: "Area Pengiriman", key: "deliveryAreaType", width: 18 },

    { header: "Sales", key: "salesName", width: 20 },
    { header: "Payment Method", key: "paymentMethod", width: 22 },

    { header: "Produk", key: "productName", width: 28 },
    { header: "Qty", key: "quantity", width: 10 },
    { header: "Ready Qty", key: "readyQty", width: 12 },
    { header: "PO Qty", key: "poQty", width: 10 },

    { header: "Harga Satuan Final", key: "unitPrice", width: 18 },
    { header: "Shipping / Item", key: "shippingCostPerItem", width: 16 },
    { header: "Discount %", key: "discountPercent", width: 14 },
    { header: "Label Harga", key: "priceTierLabel", width: 20 },
    { header: "Subtotal Item", key: "itemSubtotal", width: 18 },

    { header: "Order Subtotal", key: "orderSubtotal", width: 18 },
    { header: "Shipping Total", key: "orderShipping", width: 18 },
    { header: "Adjustment Label", key: "adjustmentLabel", width: 20 },
    { header: "Adjustment Value", key: "adjustmentValue", width: 18 },
    { header: "Total Order", key: "orderTotal", width: 18 },
    { header: "Payment Note", key: "paymentNote", width: 24 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEFF4FF" },
  };

  for (const order of orders) {
    if (order.items.length === 0) {
      sheet.addRow({
        orderCode: order.orderCode,
        createdAt: order.createdAt.toLocaleString("id-ID"),
        status: order.status,
        customerName: order.customerNameDraft,
        customerPhone: order.customerPhoneDraft,
        customerAddress: order.customerAddressDraft,
        customerDistrict: order.customerDistrictDraft,
        customerCity: order.customerCityDraft,
        deliveryAreaType: formatDeliveryAreaType(order.deliveryAreaType),
        salesName: order.sales.name,
        paymentMethod: formatPaymentMethod(order.paymentMethod),
        productName: "-",
        quantity: 0,
        readyQty: 0,
        poQty: 0,
        unitPrice: 0,
        shippingCostPerItem: 0,
        discountPercent: 0,
        priceTierLabel: "-",
        itemSubtotal: 0,
        orderSubtotal: Number(order.subtotal),
        orderShipping: Number(order.shippingCost || 0),
        adjustmentLabel: formatAdjustmentLabel(order.adjustmentType),
        adjustmentValue: Number(order.adjustmentValue),
        orderTotal: Number(order.total),
        paymentNote: order.paymentNote || "",
      });
      continue;
    }

    for (const item of order.items) {
      sheet.addRow({
        orderCode: order.orderCode,
        createdAt: order.createdAt.toLocaleString("id-ID"),
        status: order.status,
        customerName: order.customerNameDraft,
        customerPhone: order.customerPhoneDraft,
        customerAddress: order.customerAddressDraft,
        customerDistrict: order.customerDistrictDraft,
        customerCity: order.customerCityDraft,
        deliveryAreaType: formatDeliveryAreaType(order.deliveryAreaType),
        salesName: order.sales.name,
        paymentMethod: formatPaymentMethod(order.paymentMethod),
        productName: item.product.name,
        quantity: item.quantity,
        readyQty: item.readyQty,
        poQty: item.poQty,
        unitPrice: Number(item.unitPrice),
        shippingCostPerItem: Number(item.shippingCostPerItem || 0),
        discountPercent: Number(item.discountPercent || 0) * 100,
        priceTierLabel: item.priceTierLabel || "",
        itemSubtotal: Number(item.subtotal),
        orderSubtotal: Number(order.subtotal),
        orderShipping: Number(order.shippingCost || 0),
        adjustmentLabel: formatAdjustmentLabel(order.adjustmentType),
        adjustmentValue: Number(order.adjustmentValue),
        orderTotal: Number(order.total),
        paymentNote: order.paymentNote || "",
      });
    }
  }

  sheet.autoFilter = {
    from: "A1",
    to: "Z1",
  };

  for (const row of sheet.getRows(2, sheet.rowCount - 1) || []) {
    row.alignment = { vertical: "middle" };
  }

  await writeAuditLog({
    action: "EXPORT_ORDERS",
    entityType: "ORDER",
    description: "Export orders ke Excel",
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="orders-export.xlsx"`,
    },
  });
}
