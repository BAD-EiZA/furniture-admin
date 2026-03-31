import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify, generateProductQrValue } from "@/lib/product";
import { getSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
const mediaSchema = z.object({
  fileUrl: z.string().url(),
  fileKey: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"]),
  sortOrder: z.number().int().positive(),
});

const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(3),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  medias: z.array(mediaSchema).default([]),
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
        { message: "Data produk tidak valid", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, description, price, stock, medias } = parsed.data;

    let slug = slugify(name);

    const existingSlug = await prisma.product.findUnique({
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
        qrCodeValue: generateProductQrValue(),
        medias: {
          create: medias,
        },
      },
      include: {
        medias: {
          orderBy: { sortOrder: "asc" },
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("CREATE_PRODUCT_ERROR", error);
    return NextResponse.json(
      { message: "Gagal membuat produk" },
      { status: 500 },
    );
  }
}
