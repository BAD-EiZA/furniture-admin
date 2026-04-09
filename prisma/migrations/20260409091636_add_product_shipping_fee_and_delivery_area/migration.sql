-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAreaType" TEXT NOT NULL DEFAULT 'DALAM_KOTA';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shippingFee" DECIMAL(12,2) NOT NULL DEFAULT 0;
