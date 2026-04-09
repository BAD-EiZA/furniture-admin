import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import { prisma } from "@/lib/prisma";

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

export async function GET(
  _: Request,
  { params }: { params: Promise<{ orderCode: string }> },
) {
  const { orderCode } = await params;

  const order = await prisma.order.findUnique({
    where: { orderCode },
    include: {
      invoice: true,
      sales: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order || !order.invoice) {
    return NextResponse.json(
      { message: "Invoice tidak ditemukan" },
      { status: 404 },
    );
  }

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]);

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();

  const drawText = (
    text: string,
    x: number,
    y: number,
    options?: {
      size?: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
    },
  ) => {
    page.drawText(text, {
      x,
      y,
      size: options?.size || 10,
      font: options?.bold ? fontBold : fontRegular,
      color: options?.color || rgb(0.15, 0.2, 0.28),
    });
  };

  const drawWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight = 14,
    size = 10,
  ) => {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const textWidth = fontRegular.widthOfTextAtSize(testLine, size);

      if (textWidth > maxWidth) {
        drawText(line, x, currentY, { size });
        line = word;
        currentY -= lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line) {
      drawText(line, x, currentY, { size });
      currentY -= lineHeight;
    }

    return currentY;
  };

  let y = height - 50;
  const left = 40;

  // Header
  drawText("HIRONA HOMEWARE", left, y, {
    size: 22,
    bold: true,
    color: rgb(0.07, 0.37, 0.66),
  });
  y -= 26;
  drawText("INVOICE", left, y, {
    size: 16,
    bold: true,
    color: rgb(0.15, 0.2, 0.28),
  });

  drawText(`Invoice No: ${order.invoice.invoiceNumber}`, 380, height - 50, {
    size: 11,
    bold: true,
  });
  drawText(`Order Code: ${order.orderCode}`, 380, height - 66, { size: 11 });
  drawText(
    `Tanggal: ${new Date(order.invoice.issuedAt).toLocaleDateString("id-ID")}`,
    380,
    height - 82,
    { size: 11 },
  );

  // Divider
  y -= 24;
  page.drawLine({
    start: { x: left, y },
    end: { x: width - 40, y },
    thickness: 1,
    color: rgb(0.88, 0.9, 0.94),
  });

  y -= 28;

  // Customer block
  drawText("Ditagihkan kepada:", left, y, { size: 12, bold: true });
  y -= 18;
  drawText(order.customerNameDraft, left, y, { size: 11, bold: true });
  y -= 16;
  drawText(`No. HP: ${order.customerPhoneDraft}`, left, y, { size: 11 });
  y -= 16;
  drawText("Alamat:", left, y, { size: 11 });
  y -= 14;
  y = drawWrappedText(order.customerAddressDraft, left, y, 240, 14, 10);

  y -= 4;
  drawText(`Kecamatan: ${order.customerDistrictDraft}`, left, y, { size: 11 });
  y -= 16;
  drawText(`Kota: ${order.customerCityDraft}`, left, y, { size: 11 });
  y -= 16;
  drawText(
    `Metode Pembayaran: ${formatPaymentMethod(order.paymentMethod)}`,
    left,
    y,
    { size: 11 },
  );

  // Sales block
  let rightY = height - 150;
  drawText("Sales:", 380, rightY, { size: 12, bold: true });
  rightY -= 18;
  drawText(order.sales.name, 380, rightY, { size: 11, bold: true });
  rightY -= 16;
  if (order.sales.phone) {
    drawText(order.sales.phone, 380, rightY, { size: 11 });
    rightY -= 16;
  }
  drawText(order.sales.email, 380, rightY, { size: 11 });

  // Table start
  y -= 38;

  // Table header
  const tableTop = y;
  const col1 = left;
  const col2 = 280;
  const col3 = 355;
  const col4 = 420;
  const col5 = 500;

  page.drawRectangle({
    x: left,
    y: tableTop - 18,
    width: width - 80,
    height: 22,
    color: rgb(0.94, 0.97, 1),
  });

  drawText("Produk", col1 + 6, tableTop - 12, { size: 10, bold: true });
  drawText("Qty", col2 + 6, tableTop - 12, { size: 10, bold: true });
  drawText("Ready/PO", col3 + 6, tableTop - 12, { size: 10, bold: true });
  drawText("Harga", col4 + 6, tableTop - 12, { size: 10, bold: true });
  drawText("Subtotal", col5 + 6, tableTop - 12, { size: 10, bold: true });

  y = tableTop - 34;

  for (const item of order.items) {
    const rowHeight = 42;

    page.drawRectangle({
      x: left,
      y: y - 8,
      width: width - 80,
      height: rowHeight,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.9, 0.92, 0.96),
      borderWidth: 1,
    });

    drawText(item.product.name, col1 + 6, y + 16, {
      size: 10,
      bold: true,
    });

    const metaText = [
      item.priceTierLabel ? `Label: ${item.priceTierLabel}` : null,
      `Diskon: ${Number(item.discountPercent || 0) * 100}%`,
      `Ongkir/item: Rp ${Number(item.shippingCostPerItem || 0).toLocaleString(
        "id-ID",
      )}`,
    ]
      .filter(Boolean)
      .join(" • ");

    drawText(metaText, col1 + 6, y + 4, {
      size: 8,
      color: rgb(0.42, 0.49, 0.58),
    });

    drawText(String(item.quantity), col2 + 18, y + 12, { size: 10 });
    drawText(`${item.readyQty}/${item.poQty}`, col3 + 10, y + 12, { size: 10 });
    drawText(
      `Rp ${Number(item.unitPrice).toLocaleString("id-ID")}`,
      col4 + 6,
      y + 12,
      { size: 10 },
    );
    drawText(
      `Rp ${Number(item.subtotal).toLocaleString("id-ID")}`,
      col5 + 6,
      y + 12,
      { size: 10, bold: true },
    );

    y -= rowHeight + 8;
  }

  // Summary
  y -= 10;
  page.drawLine({
    start: { x: 340, y },
    end: { x: width - 40, y },
    thickness: 1,
    color: rgb(0.88, 0.9, 0.94),
  });

  y -= 18;
  drawText("Subtotal", 340, y, { size: 11 });
  drawText(`Rp ${Number(order.subtotal).toLocaleString("id-ID")}`, 470, y, {
    size: 11,
    bold: true,
  });

  y -= 18;
  drawText("Ongkir", 340, y, { size: 11 });
  drawText(
    `Rp ${Number(order.shippingCost || 0).toLocaleString("id-ID")}`,
    470,
    y,
    {
      size: 11,
      bold: true,
    },
  );

  y -= 18;
  drawText(formatAdjustmentLabel(order.adjustmentType), 340, y, { size: 11 });
  drawText(
    `${order.adjustmentType === "DISCOUNT" ? "-" : ""}Rp ${Math.abs(
      Number(order.adjustmentValue),
    ).toLocaleString("id-ID")}`,
    470,
    y,
    { size: 11, bold: true },
  );

  y -= 24;
  page.drawLine({
    start: { x: 340, y },
    end: { x: width - 40, y },
    thickness: 1,
    color: rgb(0.88, 0.9, 0.94),
  });

  y -= 18;
  drawText("Total", 340, y, {
    size: 13,
    bold: true,
  });
  drawText(`Rp ${Number(order.total).toLocaleString("id-ID")}`, 450, y, {
    size: 13,
    bold: true,
    color: rgb(0.07, 0.37, 0.66),
  });

  // Footer
  y -= 40;
  drawText("Terima kasih telah berbelanja di HIRONA HOMEWARE.", left, y, {
    size: 10,
    color: rgb(0.42, 0.49, 0.58),
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${order.orderCode}.pdf"`,
    },
  });
}
