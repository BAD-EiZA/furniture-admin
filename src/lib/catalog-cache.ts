import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function getCatalogBrands(): Promise<string[]> {
  const cacheKey = "catalog:brands";
  const cached = await getCache<string[]>(cacheKey);
  if (cached) return cached;

  const products = await prisma.product.findMany({
    where: { isActive: true, brand: { not: "" } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });

  const brands = products
    .map((p) => p.brand || "")
    .filter(Boolean);

  await setCache(cacheKey, brands, 600);
  return brands;
}

export async function getCatalogProducts(q: string, brand?: string) {
  const normalizedQ = q.trim().toLowerCase();
  const normalizedBrand = brand?.trim() || "";
  const cacheKey = `catalog:list:q=${normalizedQ || "all"}:brand=${normalizedBrand || "all"}`;

  const cached = await getCache<any[]>(cacheKey);
  if (cached) return cached;

  const where = {
    isActive: true,
    ...(normalizedBrand ? { brand: normalizedBrand } : {}),
    ...(normalizedQ
      ? {
          OR: [
            { name: { contains: normalizedQ, mode: "insensitive" as const } },
            { description: { contains: normalizedQ, mode: "insensitive" as const } },
            { brand: { contains: normalizedQ, mode: "insensitive" as const } },
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
