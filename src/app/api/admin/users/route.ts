import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createUserSchema } from "@/lib/user-schema";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SALES", "SUPER_ADMIN"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET_USERS_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengambil data user" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data user tidak valid",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { name, email, phone, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email sudah digunakan" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role,
        isActive: true,
      },
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
      action: "CREATE",
      entityType: "USER",
      entityId: user.id,
      description: `Membuat user ${user.email}`,
      afterData: user,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("CREATE_USER_ERROR", error);
    return NextResponse.json(
      { message: "Gagal membuat user" },
      { status: 500 },
    );
  }
}
