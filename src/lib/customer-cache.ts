import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";

const CUSTOMER_LIST_CACHE_KEY = (q: string) => `customers:list:${q || "all"}`;
const CUSTOMER_DETAIL_CACHE_KEY = (id: string) => `customers:detail:${id}`;

type OrderItemLite = {
  id: string;
  quantity: number;
  poQty: number;
  readyQty: number;
  product: {
    name: string;
  };
};

type OrderLite = {
  id: string;
  orderCode: string;
  total: any;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  invoice: { id: string } | null;
  sales: {
    name: string;
  };
  items: OrderItemLite[];
};

type CustomerLite = {
  id: string;
  name: string;
  phone: string;
  orders: OrderLite[];
};

type AggregatedCustomer = {
  id: string;
  sourceCustomerIds: string[];
  name: string;
  phone: string;
  orders: OrderLite[];
  aggregatedOrderCount: number;
  aggregatedTotalSpend: number;
  aggregatedTotalItems: number;
  promoEligible: boolean;
};

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function customerGroupKey(name: string, phone: string) {
  return `${normalizeName(name)}::${normalizePhone(phone)}`;
}

function aggregateCustomers(customers: CustomerLite[]): AggregatedCustomer[] {
  const map = new Map<string, AggregatedCustomer>();

  for (const customer of customers) {
    const key = customerGroupKey(customer.name, customer.phone);

    if (!map.has(key)) {
      map.set(key, {
        id: customer.id,
        sourceCustomerIds: [customer.id],
        name: customer.name,
        phone: customer.phone,
        orders: [...customer.orders],
        aggregatedOrderCount: customer.orders.length,
        aggregatedTotalSpend: customer.orders.reduce(
          (sum, order) => sum + Number(order.total),
          0,
        ),
        aggregatedTotalItems: customer.orders.reduce(
          (sum, order) =>
            sum +
            order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
          0,
        ),
        promoEligible:
          customer.orders.reduce((sum, order) => sum + Number(order.total), 0) >=
          100_000_000,
      });
    } else {
      const existing = map.get(key)!;
      existing.sourceCustomerIds.push(customer.id);
      existing.orders.push(...customer.orders);
      existing.aggregatedOrderCount += customer.orders.length;
      existing.aggregatedTotalSpend += customer.orders.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      );
      existing.aggregatedTotalItems += customer.orders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0,
      );
      existing.promoEligible = existing.aggregatedTotalSpend >= 100_000_000;
    }
  }

  return Array.from(map.values())
    .map((customer) => ({
      ...customer,
      orders: customer.orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    }))
    .sort((a, b) => b.aggregatedTotalSpend - a.aggregatedTotalSpend);
}

export async function getCustomerList(q: string) {
  const cacheKey = CUSTOMER_LIST_CACHE_KEY(q);
  const cached = await getCache(cacheKey);

  if (cached) {
    return cached as AggregatedCustomer[];
  }

  const where = q
    ? {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { phone: { contains: q, mode: "insensitive" as const } },
      ],
    }
    : {};

  const customers = await prisma.customer.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          invoice: true,
          sales: {
            select: {
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const aggregated = aggregateCustomers(customers as CustomerLite[]);

  await setCache(cacheKey, aggregated, 60 * 5);

  return aggregated;
}

export async function getCustomerDetail(id: string) {
  const cacheKey = CUSTOMER_DETAIL_CACHE_KEY(id);
  const cached = await getCache(cacheKey);

  if (cached) {
    return cached as AggregatedCustomer | null;
  }

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          invoice: true,
          sales: {
            select: {
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  const siblingCustomers = await prisma.customer.findMany({
    where: {
      name: {
        equals: customer.name,
        mode: "insensitive",
      },
      phone: customer.phone,
    },
    include: {
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          invoice: true,
          sales: {
            select: {
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const aggregated = aggregateCustomers(siblingCustomers as CustomerLite[]);
  const result = aggregated[0] || null;

  await setCache(cacheKey, result, 60 * 5);

  return result;
}