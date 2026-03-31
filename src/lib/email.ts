import { resend } from "@/lib/resend";
import { transporter } from "@/lib/mailer";
type SendOrderToSalesParams = {
  salesEmail: string;
  salesName: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  total: number;
  paymentProofUrl: string;
  confirmUrl: string;
  rejectUrl: string;
  orderCode: string;
};

export async function sendOrderToSalesEmail(params: SendOrderToSalesParams) {
  const {
    salesEmail,
    salesName,
    customerName,
    customerPhone,
    productName,
    quantity,
    total,
    paymentProofUrl,
    confirmUrl,
    rejectUrl,
    orderCode,
  } = params;

  await transporter.sendMail({
    from: `"Furniture App" <${process.env.SMTP_USER}>`,
    to: salesEmail,
    subject: `Konfirmasi pembayaran ${orderCode}`,
    html: `
   <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2>Konfirmasi Pembayaran Order</h2>
        <p>Halo ${salesName},</p>
        <p>Ada pembayaran baru yang menunggu konfirmasi.</p>

        <table cellpadding="6" cellspacing="0" border="0">
          <tr>
            <td><strong>Order Code</strong></td>
            <td>${orderCode}</td>
          </tr>
          <tr>
            <td><strong>Customer</strong></td>
            <td>${customerName}</td>
          </tr>
          <tr>
            <td><strong>No. HP</strong></td>
            <td>${customerPhone}</td>
          </tr>
          <tr>
            <td><strong>Produk</strong></td>
            <td>${productName}</td>
          </tr>
          <tr>
            <td><strong>Quantity</strong></td>
            <td>${quantity}</td>
          </tr>
          <tr>
            <td><strong>Total</strong></td>
            <td>Rp ${Number(total).toLocaleString("id-ID")}</td>
          </tr>
        </table>

        <p>
          <a href="${paymentProofUrl}" target="_blank">Lihat bukti pembayaran</a>
        </p>

        <div style="margin-top:24px;">
          <a
            href="${confirmUrl}"
            style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:10px;margin-right:8px;"
          >
            Konfirmasi
          </a>

          <a
            href="${rejectUrl}"
            style="display:inline-block;padding:12px 18px;background:#dc2626;color:#fff;text-decoration:none;border-radius:10px;"
          >
            Tolak
          </a>
        </div>
      </div>
  `,
  });

}
