import { nanoid } from "nanoid";

export function generateOrderCode() {
  return `ORD-${nanoid(8).toUpperCase()}`;
}

export function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = nanoid(6).toUpperCase();

  return `INV/${year}/${month}/${random}`;
}
