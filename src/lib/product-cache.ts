import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function getProductDetailBySlug(slug: string) {
  const cacheKey = `product:detail:${slug}`;

  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
      },
      tierPrices: {
        orderBy: { minQty: "asc" },
      },
    },
  });

  if (product) {
    await setCache(cacheKey, product, 900);
  }

  return product;
}