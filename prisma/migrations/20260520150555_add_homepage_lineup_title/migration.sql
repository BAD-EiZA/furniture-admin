-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "brand" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "homepageLineupTitle" TEXT;
