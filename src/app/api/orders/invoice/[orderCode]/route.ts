import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function GET(
  _req: Request,
  context: { params: Promise<{ orderCode: string }> },
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
        { status: 404 },
      );
    }

    const item = order.items[0];

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;

    page.drawText("INVOICE", {
      x: 50,
      y,
      size: 24,
      font: bold,
      color: rgb(0.12, 0.2, 0.6),
    });

    y -= 40;
    page.drawText(`Invoice Number: ${order.invoice.invoiceNumber}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 20;
    page.drawText(`Order Code: ${order.orderCode}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 20;
    page.drawText(`Tanggal: ${order.invoice.issuedAt.toISOString()}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 40;
    page.drawText("Customer", {
      x: 50,
      y,
      size: 14,
      font: bold,
    });

    y -= 20;
    page.drawText(`Nama: ${order.customerNameDraft}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 20;
    page.drawText(`No. HP: ${order.customerPhoneDraft}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 40;
    page.drawText("Detail Barang", {
      x: 50,
      y,
      size: 14,
      font: bold,
    });

    y -= 20;
    page.drawText(`Produk: ${item?.product.name || "-"}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 20;
    page.drawText(`Quantity: ${item?.quantity || 0}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 20;
    page.drawText(
      `Harga Satuan: Rp ${Number(item?.price || 0).toLocaleString("id-ID")}`,
      {
        x: 50,
        y,
        size: 12,
        font,
      },
    );

    y -= 20;
    page.drawText(`Total: Rp ${Number(order.total).toLocaleString("id-ID")}`, {
      x: 50,
      y,
      size: 12,
      font: bold,
    });

    y -= 40;
    page.drawText("Sales", {
      x: 50,
      y,
      size: 14,
      font: bold,
    });

    y -= 20;
    page.drawText(`Nama: ${order.sales.name}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 20;
    page.drawText(`Email: ${order.sales.email}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

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
      { status: 500 },
    );
  }
}
