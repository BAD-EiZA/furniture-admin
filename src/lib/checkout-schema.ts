import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
      })
    )
    .min(1),

  salesId: z.string().min(1, "Nama sales wajib dipilih"),
  customerName: z.string().min(2, "Nama wajib diisi"),
  customerPhone: z.string().min(8, "Nomor HP wajib diisi"),
  customerAddress: z.string().min(5, "Alamat lengkap wajib diisi"),
  customerDistrict: z.string().min(2, "Kecamatan wajib diisi"),
  customerCity: z.enum([
    "Samarinda",
    "Balikpapan",
    "Bontang",
    "Sangatta",
    "Bengalon",
  ]),

  paymentMethod: z.enum(["TRANSFER", "COD", "TEMPO"], {
    message: "Metode pembayaran wajib dipilih",
  }),
  paymentNote: z.string().optional(),
  acceptPoItems: z.boolean().optional().default(false),

  paymentProof: z
    .object({
      fileUrl: z.string().url(),
      fileKey: z.string().optional(),
      mimeType: z.string().optional(),
    })
    .optional(),
});