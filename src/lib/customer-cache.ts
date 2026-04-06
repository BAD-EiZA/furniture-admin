import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

export async function getCustomerList(q: string) {
  const normalizedQ = q.trim().toLowerCase();
  const cacheKey = `customers:list:q=${normalizedQ || "all"}`;

  const cached = await getCache<any[]>(cacheKey);
  if (cached) return cached;

  const where = normalizedQ
    ? {
        OR: [
          { name: { contains: normalizedQ, mode: "insensitive" as const } },
          { phone: { contains: normalizedQ, mode: "insensitive" as const } },
        ],
      }
    : {};

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        include: {
          items: true,
        },
      },
    },
  });

  await setCache(cacheKey, customers, 300);

  return customers;
}


export async function getCustomerDetail(customerId: string) {
  const cacheKey = `customers:detail:${customerId}`;

  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: {
        include: {
          sales: true,
          invoice: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (customer) {
    await setCache(cacheKey, customer, 300);
  }

  return customer;
}