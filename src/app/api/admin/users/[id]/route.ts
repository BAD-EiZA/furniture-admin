import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateUserSchema } from "@/lib/user-schema";
import { writeAuditLog } from "@/lib/audit";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET_USER_DETAIL_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengambil detail user" },
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

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data user tidak valid",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    const sameEmail = await prisma.user.findFirst({
      where: {
        email: parsed.data.email,
        NOT: { id },
      },
    });

    if (sameEmail) {
      return NextResponse.json(
        { message: "Email sudah digunakan user lain" },
        { status: 409 },
      );
    }

    const updateData: {
      name: string;
      email: string;
      phone: string | null;
      role: "ADMIN" | "SALES";
      isActive: boolean;
      passwordHash?: string;
    } = {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      role: parsed.data.role,
      isActive: parsed.data.isActive,
    };

    if (parsed.data.password && parsed.data.password.trim()) {
      updateData.passwordHash = await bcrypt.hash(parsed.data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await writeAuditLog({
      action: "UPDATE",
      entityType: "USER",
      entityId: updated.id,
      description: `Mengupdate user ${updated.email}`,
      beforeData: {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        role: existing.role,
        isActive: existing.isActive,
      },
      afterData: updated,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE_USER_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengupdate user" },
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

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    if (session.userId === id) {
      return NextResponse.json(
        { message: "Tidak bisa menonaktifkan akun sendiri" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    if (existing.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "SUPER_ADMIN tidak boleh dihapus dari panel ini" },
        { status: 400 },
      );
    }

    if (!existing.isActive) {
      return NextResponse.json({
        message: "User sudah nonaktif",
      });
    }

    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      message: "User berhasil dinonaktifkan",
    });
  } catch (error) {
    console.error("DELETE_USER_ERROR", error);
    return NextResponse.json(
      { message: "Gagal menonaktifkan user" },
      { status: 500 },
    );
  }
}
