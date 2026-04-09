import { z } from "zod";

export const updateSiteSettingSchema = z.object({
  companyName: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  qrisImageUrl: z.string().optional().nullable(),
  googleMapsEmbed: z.string().optional().nullable(),

  whatsappAdmin: z.string().optional().nullable(),
  whatsappMarketing: z.string().optional().nullable(),
  whatsappSales: z.string().optional().nullable(),
  whatsappOwner: z.string().optional().nullable(),

  instagramUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  tiktokUrl: z.string().optional().nullable(),
  homepageHeadline: z.string().optional().nullable(),
  homepageSubheadline: z.string().optional().nullable(),
  featuredMode: z.enum(["PRODUCT", "PROMO"]).optional().nullable(),
  featuredPromoTitle: z.string().optional().nullable(),
  featuredPromoText: z.string().optional().nullable(),
  featuredPromoBadge: z.string().optional().nullable(),
});
