import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function getHomepageFeaturedProducts() {
  const cacheKey = "homepage:featured";

  const cached = await getCache<any[]>(cacheKey);
  if (cached) return cached;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  await setCache(cacheKey, products, 900);

  return products;
}
