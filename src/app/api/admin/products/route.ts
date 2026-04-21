import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify, generateProductQrValue } from "@/lib/product";
import { getSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { createProductSchema } from "@/lib/product-schema";
import { createStockHistory } from "@/lib/stock-history";
import { deleteCache, deleteCacheByPattern } from "@/lib/cache";
const mediaSchema = z.object({
  fileUrl: z.string().url(),
  fileKey: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"]),
  sortOrder: z.number().int().positive(),
});

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        medias: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengambil data produk" },
      { status: 500 },
    );
  }
}

function generateQrCodeValue(name: string) {
  const base = slugify(name).toUpperCase().replace(/-/g, "");
  return `PRD-${base}-${Date.now()}`;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data produk tidak valid",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      name,
      description,
      price,
      stock,
      readyStock,
      allowPreOrder,
      shippingFee,
      pcsPerBal,
      medias,
      tierPrices,
    } = parsed.data;

    if (readyStock > stock) {
      return NextResponse.json(
        { message: "Ready stock tidak boleh lebih besar dari total stock" },
        { status: 400 },
      );
    }

    let slug = slugify(name);

    const existingSlug = await prisma.product.findFirst({
      where: { slug },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        stock,
        readyStock,
        allowPreOrder,
        shippingFee,
        pcsPerBal,
        qrCodeValue: generateQrCodeValue(name),
        medias: {
          create: medias,
        },
        tierPrices: {
          create: tierPrices
            .sort((a, b) => a.minQty - b.minQty)
            .map((tier) => ({
              minQty: tier.minQty,
              price: tier.price,
              label: tier.label || null,
            })),
        },
      },
      include: {
        medias: {
          orderBy: { sortOrder: "asc" },
        },
        tierPrices: {
          orderBy: { minQty: "asc" },
        },
      },
    });

    await writeAuditLog({
      action: "CREATE",
      entityType: "PRODUCT",
      entityId: product.id,
      description: `Membuat produk ${product.name}`,
      afterData: product,
    });

    await createStockHistory({
      productId: product.id,
      type: "PRODUCT_CREATE",
      stockBefore: 0,
      stockAfter: product.stock,
      readyBefore: 0,
      readyAfter: product.readyStock,
      changeAmount: product.readyStock,
      note: `Produk ${product.name} dibuat`,
    });
    await deleteCacheByPattern("homepage:*");
    await deleteCacheByPattern("catalog:*");
    await deleteCache(`product:detail:${product.slug}`);
    await deleteCache("admin:dashboard:summary");
    await deleteCache("admin:analytics:summary");
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("CREATE_PRODUCT_ERROR", error);

    return NextResponse.json(
      { message: "Gagal membuat produk" },
      { status: 500 },
    );
  }
}
