import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function getStockHistoryList(q: string) {
  const normalizedQ = q.trim().toLowerCase();
  const cacheKey = `stock-history:q=${normalizedQ || "all"}`;

  const cached = await getCache<any[]>(cacheKey);
  if (cached) return cached;

  const histories = await prisma.stockHistory.findMany({
    where: normalizedQ
      ? {
          OR: [
            {
              product: {
                name: {
                  contains: normalizedQ,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              note: {
                contains: normalizedQ,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {},
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  await setCache(cacheKey, histories, 300);

  return histories;
}
