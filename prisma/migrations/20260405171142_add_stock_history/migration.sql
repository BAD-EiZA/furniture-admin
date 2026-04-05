-- CreateEnum
CREATE TYPE "StockHistoryType" AS ENUM ('MANUAL_UPDATE', 'ORDER_CONFIRMATION', 'PRODUCT_CREATE');

-- CreateTable
CREATE TABLE "StockHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "StockHistoryType" NOT NULL,
    "stockBefore" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "readyBefore" INTEGER NOT NULL,
    "readyAfter" INTEGER NOT NULL,
    "changeAmount" INTEGER NOT NULL,
    "note" TEXT,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorRole" "UserRole",
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockHistory_productId_createdAt_idx" ON "StockHistory"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "StockHistory" ADD CONSTRAINT "StockHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
