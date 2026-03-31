import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/product";
import { getSession } from "@/lib/auth";
import { utapi } from "@/lib/uploadthing";
import { writeAuditLog } from "@/lib/audit";
const mediaSchema = z.object({
  fileUrl: z.string().url(),
  fileKey: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"]),
  sortOrder: z.number().int().positive(),
});

const updateProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(3),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  medias: z.array(mediaSchema).default([]),
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
        { message: "Data produk tidak valid", errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

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

    let slug = slugify(parsed.data.name);

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

    const nextFileKeys = parsed.data.medias
      .map((item) => item.fileKey)
      .filter((key): key is string => Boolean(key));

    const removedFileKeys = oldFileKeys.filter(
      (key) => !nextFileKeys.includes(key),
    );

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        price: parsed.data.price,
        stock: parsed.data.stock,
        medias: {
          deleteMany: {},
          create: parsed.data.medias,
        },
      },
      include: {
        medias: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

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
