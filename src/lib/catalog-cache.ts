import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function getCatalogProducts(q: string) {
  const normalizedQ = q.trim().toLowerCase();
  const cacheKey = `catalog:list:q=${normalizedQ || "all"}`;

  const cached = await getCache<any[]>(cacheKey);
  if (cached) return cached;

  const where = {
    isActive: true,
    ...(normalizedQ
      ? {
          OR: [
            { name: { contains: normalizedQ, mode: "insensitive" as const } },
            {
              description: {
                contains: normalizedQ,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      medias: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
  });

  await setCache(cacheKey, products, 600);

  return products;
}
