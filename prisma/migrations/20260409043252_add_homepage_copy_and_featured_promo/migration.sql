/*
  Warnings:

  - Added the required column `customerCityDraft` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerDistrictDraft` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerCityDraft" TEXT NOT NULL,
ADD COLUMN     "customerDistrictDraft" TEXT NOT NULL,
ADD COLUMN     "shippingCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
ALTER COLUMN "customerAddressDraft" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shippingCostPerItem" DECIMAL(12,2) NOT NULL DEFAULT 0,
ALTER COLUMN "unitPrice" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pcsPerBal" INTEGER NOT NULL DEFAULT 24;

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "companyName" TEXT,
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "qrisImageUrl" TEXT,
    "googleMapsEmbed" TEXT,
    "whatsappAdmin" TEXT,
    "whatsappMarketing" TEXT,
    "whatsappSales" TEXT,
    "whatsappOwner" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "homepageHeadline" TEXT,
    "homepageSubheadline" TEXT,
    "featuredMode" TEXT DEFAULT 'PRODUCT',
    "featuredPromoTitle" TEXT,
    "featuredPromoText" TEXT,
    "featuredPromoBadge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
