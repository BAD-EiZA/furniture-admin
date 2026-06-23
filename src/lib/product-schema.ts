import { z } from "zod";

const mediaSchema = z.object({
    fileUrl: z.string().url(),
    fileKey: z.string().optional().nullable(),
    type: z.enum(["IMAGE", "VIDEO"]),
    sortOrder: z.coerce.number().int().min(0),
});

const tierPriceSchema = z.object({
    minQty: z.coerce.number().int().min(1),
    price: z.coerce.number().min(0),
    label: z.string().optional().nullable(),
});

const bonusRuleSchema = z.object({
    minQty: z.coerce.number().int().min(1, "Min qty bonus minimal 1"),
    bonusProductId: z.string().min(1, "Produk bonus wajib dipilih"),
    bonusQty: z.coerce.number().int().min(1, "Jumlah bonus minimal 1"),
});

export const createProductSchema = z.object({
    name: z.string().min(2, "Nama produk minimal 2 karakter"),
    description: z.string().min(5, "Deskripsi minimal 5 karakter"),
    price: z.coerce.number().min(0, "Harga tidak valid"),
    stock: z.coerce.number().int().min(0),
    readyStock: z.coerce.number().int().min(0),
    allowPreOrder: z.boolean(),
    pcsPerBal: z.coerce.number().int().min(1, "Pcs per bal minimal 1"),
    shippingFee: z.coerce.number().min(0, "Ongkir produk tidak valid"),
    brand: z.string().optional().default(""),
    medias: z.array(mediaSchema).min(1, "Minimal 1 media"),
    tierPrices: z.array(tierPriceSchema).min(1, "Minimal 1 tier harga"),
    bonusRules: z.array(bonusRuleSchema).default([]),
});

export const updateProductSchema = z.object({
    name: z.string().min(2, "Nama produk wajib diisi"),
    description: z.string().min(5, "Deskripsi produk wajib diisi"),
    price: z.coerce.number().min(0, "Harga tidak valid"),
    stock: z.coerce.number().int().min(0, "Stock tidak valid"),
    readyStock: z.coerce.number().int().min(0, "Ready stock tidak valid"),
    allowPreOrder: z.boolean(),

    pcsPerBal: z.coerce.number().int().min(1, "Pcs per bal minimal 1"),
    shippingFee: z.coerce.number().min(0, "Ongkir produk tidak valid"),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    brand: z.string().optional().default(""),

    medias: z.array(mediaSchema).min(1, "Minimal 1 media produk"),
    tierPrices: z.array(tierPriceSchema).default([]),
    bonusRules: z.array(bonusRuleSchema).default([]),
});
