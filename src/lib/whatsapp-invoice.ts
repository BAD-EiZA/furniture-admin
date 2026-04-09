export function buildSalesInvoiceWhatsappMessage(params: {
  customerName: string;
  orderCode: string;
  invoiceNumber: string;
  total: number;
  invoicePdfUrl: string;
}) {
  return `Halo ${params.customerName},

Berikut kami kirimkan invoice untuk pesanan Anda.

Order Code: ${params.orderCode}
Invoice: ${params.invoiceNumber}
Total: Rp ${params.total.toLocaleString("id-ID")}

Silakan lihat invoice PDF melalui link berikut:
${params.invoicePdfUrl}

Terima kasih.
HIRONA HOMEWARE`;
}
