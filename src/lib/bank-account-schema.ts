import { z } from "zod";

export const bankAccountSchema = z.object({
  bankName: z.string().min(2, "Nama bank wajib diisi"),
  accountName: z.string().min(2, "Atas nama wajib diisi"),
  accountNumber: z.string().min(3, "Nomor rekening wajib diisi"),
  label: z.string().optional().default(""),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(1),
});
