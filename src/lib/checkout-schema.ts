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

  salesId: z.string().min(1),
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerAddress: z.string().min(5),

  paymentMethod: z.enum(["TRANSFER", "COD", "TEMPO"]),
  paymentNote: z.string().optional(),

  paymentProof: z
    .object({
      fileUrl: z.string().url(),
      fileKey: z.string().optional(),
      mimeType: z.string().optional(),
    })
    .optional(),
});