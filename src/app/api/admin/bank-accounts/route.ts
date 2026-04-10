import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { bankAccountSchema } from "@/lib/bank-account-schema";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(bankAccounts);
  } catch (error) {
    console.error("GET_BANK_ACCOUNTS_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengambil daftar rekening" },
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

    const created = await prisma.bankAccount.create({
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
      action: "CREATE",
      entityType: "BANK_ACCOUNT",
      entityId: created.id,
      description: `Membuat rekening ${created.label || created.bankName}`,
      afterData: created,
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("CREATE_BANK_ACCOUNT_ERROR", error);
    return NextResponse.json(
      { message: "Gagal membuat rekening" },
      { status: 500 },
    );
  }
}
