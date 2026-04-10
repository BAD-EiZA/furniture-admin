import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { bankAccountSchema } from "@/lib/bank-account-schema";
import { writeAuditLog } from "@/lib/audit";

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

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!bankAccount) {
      return NextResponse.json(
        { message: "Rekening tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(bankAccount);
  } catch (error) {
    console.error("GET_BANK_ACCOUNT_DETAIL_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengambil detail rekening" },
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
    const parsed = bankAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data rekening tidak valid",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const existing = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Rekening tidak ditemukan" },
        { status: 404 },
      );
    }

    const updated = await prisma.bankAccount.update({
      where: { id },
      data: {
        bankName: parsed.data.bankName,
        accountName: parsed.data.accountName,
        accountNumber: parsed.data.accountNumber,
        label: parsed.data.label || null,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder,
      },
    });

    await writeAuditLog({
      action: "UPDATE",
      entityType: "BANK_ACCOUNT",
      entityId: updated.id,
      description: `Mengupdate rekening ${updated.label || updated.bankName}`,
      beforeData: existing,
      afterData: updated,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE_BANK_ACCOUNT_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengupdate rekening" },
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

    const existing = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Rekening tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.bankAccount.delete({
      where: { id },
    });

    await writeAuditLog({
      action: "DELETE",
      entityType: "BANK_ACCOUNT",
      entityId: existing.id,
      description: `Menghapus rekening ${existing.label || existing.bankName}`,
      beforeData: existing,
    });

    return NextResponse.json({ message: "Rekening berhasil dihapus" });
  } catch (error) {
    console.error("DELETE_BANK_ACCOUNT_ERROR", error);
    return NextResponse.json(
      { message: "Gagal menghapus rekening" },
      { status: 500 },
    );
  }
}
