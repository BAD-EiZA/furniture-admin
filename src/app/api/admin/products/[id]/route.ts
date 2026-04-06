import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/product";
import { getSession } from "@/lib/auth";
import { utapi } from "@/lib/uploadthing";
import { writeAuditLog } from "@/lib/audit";
import { updateProductSchema } from "@/lib/product-schema";
import { createStockHistory } from "@/lib/stock-history";
import { deleteCache, deleteCacheByPattern } from "@/lib/cache";
const mediaSchema = z.object({
  fileUrl: z.string().url(),
  fileKey: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"]),
  sortOrder: z.number().int().positive(),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        medias: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET_PRODUCT_DETAIL_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengambil detail produk" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data produk tidak valid",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        medias: true,
        tierPrices: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    const {
      name,
      description,
      price,
      stock,
      readyStock,
      allowPreOrder,
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

    const sameSlugUsed = await prisma.product.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (sameSlugUsed) {
      slug = `${slug}-${Date.now()}`;
    }

    const oldFileKeys = existing.medias
      .map((item) => item.fileKey)
      .filter((key): key is string => Boolean(key));

    const nextFileKeys = medias
      .map((item) => item.fileKey)
      .filter((key): key is string => Boolean(key));

    const removedFileKeys = oldFileKeys.filter(
      (key) => !nextFileKeys.includes(key),
    );

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        stock,
        readyStock,
        allowPreOrder,
        medias: {
          deleteMany: {},
          create: medias,
        },
        tierPrices: {
          deleteMany: {},
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

    if (
      existing.stock !== updated.stock ||
      existing.readyStock !== updated.readyStock
    ) {
      await createStockHistory({
        productId: updated.id,
        type: "MANUAL_UPDATE",
        stockBefore: existing.stock,
        stockAfter: updated.stock,
        readyBefore: existing.readyStock,
        readyAfter: updated.readyStock,
        changeAmount: updated.readyStock - existing.readyStock,
        note: `Update manual oleh admin untuk produk ${updated.name}`,
      });
    }

    if (removedFileKeys.length > 0) {
      await utapi.deleteFiles(removedFileKeys);
    }

    await writeAuditLog({
      action: "UPDATE",
      entityType: "PRODUCT",
      entityId: updated.id,
      description: `Mengupdate produk ${updated.name}`,
      beforeData: existing,
      afterData: updated,
    });

    await deleteCacheByPattern("homepage:*");
    await deleteCacheByPattern("catalog:*");
    await deleteCache(`product:detail:${existing.slug}`);
    await deleteCache(`product:detail:${updated.slug}`);
    await deleteCache("admin:dashboard:summary");
    await deleteCache("admin:analytics:summary");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR", error);

    return NextResponse.json(
      { message: "Gagal mengupdate produk" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        medias: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    const fileKeys = existing.medias
      .map((item) => item.fileKey)
      .filter((key): key is string => Boolean(key));

    await prisma.product.delete({
      where: { id },
    });

    if (fileKeys.length > 0) {
      await utapi.deleteFiles(fileKeys);
    }

    await writeAuditLog({
      action: "DELETE",
      entityType: "PRODUCT",
      entityId: existing.id,
      description: `Menghapus produk ${existing.name}`,
      beforeData: existing,
    });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("DELETE_PRODUCT_ERROR", error);
    return NextResponse.json(
      { message: "Gagal menghapus produk" },
      { status: 500 },
    );
  }
}
