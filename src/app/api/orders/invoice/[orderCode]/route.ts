import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

function formatPaymentMethod(method: string) {
  switch (method) {
    case "TRANSFER":
      return "Transfer Sebelum Pengiriman";
    case "COD":
      return "COD";
    case "TEMPO":
      return "Tempo";
    default:
      return method;
  }
}

function formatAdjustmentLabel(type: string) {
  switch (type) {
    case "DISCOUNT":
      return "Potongan";
    case "SURCHARGE":
      return "Tambahan";
    default:
      return "Penyesuaian";
  }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ orderCode: string }> }
) {
  try {
    const { orderCode } = await context.params;

    const order = await prisma.order.findUnique({
      where: { orderCode },
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

    if (!order || !order.invoice) {
      return NextResponse.json(
        { message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595;
    const pageHeight = 842;
    const left = 50;
    const right = 545;
    let y = 800;

    function ensureSpace(minY = 80) {
      if (y < minY) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }
    }

    function drawText(
      text: string,
      x: number,
      yy: number,
      options?: {
        size?: number;
        bold?: boolean;
        color?: ReturnType<typeof rgb>;
      }
    ) {
      page.drawText(text, {
        x,
        y: yy,
        size: options?.size || 12,
        font: options?.bold ? bold : font,
        color: options?.color || rgb(0.15, 0.2, 0.28),
      });
    }

    function drawLine(yy: number) {
      page.drawLine({
        start: { x: left, y: yy },
        end: { x: right, y: yy },
        thickness: 1,
        color: rgb(0.88, 0.91, 0.95),
      });
    }

    function drawWrappedText(
      text: string,
      x: number,
      yy: number,
      maxWidth: number,
      lineHeight = 14,
      size = 11
    ) {
      const words = text.split(" ");
      let line = "";
      const lines: string[] = [];

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);

        if (testWidth > maxWidth) {
          if (line) lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }

      if (line) lines.push(line);

      for (const lineText of lines) {
        drawText(lineText, x, yy, { size });
        yy -= lineHeight;
      }

      return yy;
    }

    // Header
    drawText("INVOICE", left, y, {
      size: 24,
      bold: true,
      color: rgb(0.12, 0.29, 0.84),
    });

    y -= 35;
    drawText(`Invoice Number: ${order.invoice.invoiceNumber}`, left, y, {
      size: 11,
      bold: true,
    });

    y -= 18;
    drawText(`Order Code: ${order.orderCode}`, left, y, { size: 11 });
    y -= 18;
    drawText(`Tanggal Invoice: ${order.invoice.issuedAt.toISOString()}`, left, y, {
      size: 11,
    });

    y -= 25;
    drawLine(y);
    y -= 24;

    // Customer section
    drawText("Customer", left, y, { size: 14, bold: true });
    y -= 18;
    drawText(`Nama: ${order.customerNameDraft}`, left, y, { size: 11 });
    y -= 16;
    drawText(`No. HP: ${order.customerPhoneDraft}`, left, y, { size: 11 });
    y -= 16;
    drawText("Alamat:", left, y, { size: 11 });

    y -= 14;
    y = drawWrappedText(order.customerAddressDraft, left + 10, y, 460, 14, 10.5);

    y -= 8;
    drawText(`Metode Pembayaran: ${formatPaymentMethod(order.paymentMethod)}`, left, y, {
      size: 11,
    });

    y -= 25;
    drawLine(y);
    y -= 24;

    // Sales section
    drawText("Sales", left, y, { size: 14, bold: true });
    y -= 18;
    drawText(`Nama: ${order.sales.name}`, left, y, { size: 11 });
    y -= 16;
    drawText(`Email: ${order.sales.email}`, left, y, { size: 11 });
    if (order.sales.phone) {
      y -= 16;
      drawText(`No. HP: ${order.sales.phone}`, left, y, { size: 11 });
    }

    y -= 25;
    drawLine(y);
    y -= 24;

    // Table header
    drawText("Item Pesanan", left, y, { size: 14, bold: true });
    y -= 22;

    // header row
    page.drawRectangle({
      x: left,
      y: y - 4,
      width: 495,
      height: 22,
      color: rgb(0.95, 0.97, 1),
      borderWidth: 1,
      borderColor: rgb(0.86, 0.9, 0.96),
    });

    drawText("Produk", left + 8, y + 4, { size: 9, bold: true });
    drawText("Qty", 260, y + 4, { size: 9, bold: true });
    drawText("Ready/PO", 305, y + 4, { size: 9, bold: true });
    drawText("Harga", 385, y + 4, { size: 9, bold: true });
    drawText("Subtotal", 460, y + 4, { size: 9, bold: true });

    y -= 28;

    for (const item of order.items) {
      ensureSpace(140);

      const productName = item.product.name;
      const maxNameWidth = 185;
      const nameSize = 10;
      const lineHeight = 13;

      const words = productName.split(" ");
      let line = "";
      const lines: string[] = [];

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, nameSize);

        if (testWidth > maxNameWidth) {
          if (line) lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);

      const rowHeight = Math.max(26, lines.length * lineHeight + 14);

      page.drawRectangle({
        x: left,
        y: y - 6,
        width: 495,
        height: rowHeight,
        color: rgb(1, 1, 1),
        borderWidth: 1,
        borderColor: rgb(0.92, 0.94, 0.97),
      });

      let nameY = y + rowHeight - 18;
      for (const lineText of lines) {
        drawText(lineText, left + 8, nameY, { size: 10 });
        nameY -= lineHeight;
      }

      drawText(String(item.quantity), 260, y + rowHeight - 18, { size: 10 });
      drawText(`${item.readyQty}/${item.poQty}`, 305, y + rowHeight - 18, {
        size: 10,
      });
      drawText(
        `Rp ${Number(item.unitPrice).toLocaleString("id-ID")}`,
        385,
        y + rowHeight - 18,
        { size: 10 }
      );
      drawText(
        `Rp ${Number(item.subtotal).toLocaleString("id-ID")}`,
        460,
        y + rowHeight - 18,
        { size: 10 }
      );

      // tier label
      if (item.priceTierLabel) {
        drawText(`Tier: ${item.priceTierLabel}`, left + 8, y + 8, {
          size: 8,
          color: rgb(0.42, 0.49, 0.58),
        });
      }

      y -= rowHeight + 8;
    }

    y -= 8;
    drawLine(y);
    y -= 22;

    // Summary
    drawText("Ringkasan Pembayaran", left, y, { size: 14, bold: true });
    y -= 22;

    drawText("Subtotal", left, y, { size: 11 });
    drawText(`Rp ${Number(order.subtotal).toLocaleString("id-ID")}`, 430, y, {
      size: 11,
      bold: true,
    });

    y -= 18;
    drawText(formatAdjustmentLabel(order.adjustmentType), left, y, { size: 11 });
    drawText(
      `${order.adjustmentType === "DISCOUNT" ? "-" : ""}Rp ${Number(
        order.adjustmentValue
      ).toLocaleString("id-ID")}`,
      430,
      y,
      { size: 11, bold: true }
    );

    y -= 24;
    page.drawRectangle({
      x: left,
      y: y - 6,
      width: 495,
      height: 28,
      color: rgb(0.07, 0.1, 0.17),
    });

    drawText("Total Akhir", left + 10, y + 4, {
      size: 12,
      bold: true,
      color: rgb(1, 1, 1),
    });

    drawText(`Rp ${Number(order.total).toLocaleString("id-ID")}`, 410, y + 4, {
      size: 12,
      bold: true,
      color: rgb(1, 1, 1),
    });

    y -= 42;

    // Footer note
    ensureSpace(90);
    drawLine(y);
    y -= 18;
    drawText(
      "Catatan: Invoice ini dibuat oleh sistem dan digunakan sebagai dokumen transaksi internal.",
      left,
      y,
      { size: 9, color: rgb(0.42, 0.49, 0.58) }
    );

    const pdfBytes = await pdfDoc.save();

    await writeAuditLog({
      action: "DOWNLOAD_INVOICE",
      entityType: "ORDER",
      entityId: order.id,
      description: `Download PDF invoice ${order.invoice.invoiceNumber}`,
      afterData: {
        orderCode: order.orderCode,
        invoiceNumber: order.invoice.invoiceNumber,
      },
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${order.invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("DOWNLOAD_INVOICE_ERROR", error);

    return NextResponse.json(
      { message: "Gagal membuat invoice PDF" },
      { status: 500 }
    );
  }
}