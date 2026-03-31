import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z
    .string()
    .min(8, "Nomor HP minimal 8 digit")
    .optional()
    .or(z.literal("")),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "SALES"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z
    .string()
    .min(8, "Nomor HP minimal 8 digit")
    .optional()
    .or(z.literal("")),
  password: z.string().optional(),
  role: z.enum(["ADMIN", "SALES"]),
  isActive: z.boolean(),
});
