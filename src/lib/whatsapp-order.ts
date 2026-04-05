type OrderWhatsAppParams = {
    customerName: string;
    orderCode: string;
    items: {
      name: string;
      quantity: number;
      subtotal: number;
      readyQty: number;
      poQty: number;
    }[];
    total: number;
    paymentMethod: string;
    address: string;
  };
  
  export function buildWhatsAppOrderMessage(params: OrderWhatsAppParams) {
    const itemsText = params.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} x ${item.quantity} - Rp ${item.subtotal.toLocaleString(
            "id-ID"
          )} (Ready: ${item.readyQty}, PO: ${item.poQty})`
      )
      .join("\n");
  
    return `Halo, saya sudah melakukan pemesanan.
  
  Order Code: ${params.orderCode}
  Nama: ${params.customerName}
  Metode Pembayaran: ${params.paymentMethod}
  Alamat: ${params.address}
  
  Item:
  ${itemsText}
  
  Total: Rp ${params.total.toLocaleString("id-ID")}
  
  Mohon dibantu untuk konfirmasi pesanan saya.`;
  }