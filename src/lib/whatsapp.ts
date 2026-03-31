type BuildWhatsAppInvoiceMessageParams = {
  customerName: string;
  invoiceNumber: string;
  orderCode: string;
  productName: string;
  quantity: number;
  total: number;
  invoicePdfUrl: string;
};

export function buildWhatsAppInvoiceMessage(
  params: BuildWhatsAppInvoiceMessageParams,
) {
  return `Halo ${params.customerName},

Pembayaran Anda telah kami konfirmasi. Berikut detail invoice Anda:

Invoice: ${params.invoiceNumber}
Order Code: ${params.orderCode}
Produk: ${params.productName}
Quantity: ${params.quantity}
Total: Rp ${params.total.toLocaleString("id-ID")}

Silakan buka invoice PDF melalui link berikut:
${params.invoicePdfUrl}

Terima kasih.`;
}
