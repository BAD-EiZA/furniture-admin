/*
  Warnings:

  - You are about to drop the column `price` on the `OrderItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFER', 'COD', 'TEMPO');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('DISCOUNT', 'SURCHARGE', 'NONE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "adjustmentType" "AdjustmentType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "adjustmentValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "customerAddressDraft" TEXT NOT NULL DEFAULT 'Tangerang',
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'TRANSFER';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "price",
ADD COLUMN     "poQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "priceTierLabel" TEXT,
ADD COLUMN     "readyQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 20000;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "allowPreOrder" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "readyStock" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ProductTierPrice" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "minQty" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTierPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductTierPrice_productId_minQty_idx" ON "ProductTierPrice"("productId", "minQty");

-- AddForeignKey
ALTER TABLE "ProductTierPrice" ADD CONSTRAINT "ProductTierPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
