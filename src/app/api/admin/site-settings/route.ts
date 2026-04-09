import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { deleteCache, deleteCacheByPattern } from "@/lib/cache";
import { DEFAULT_SITE_SETTING_ID, getSiteSetting } from "@/lib/site-settings";
import { updateSiteSettingSchema } from "@/lib/site-settings-schema";

export async function GET() {
  try {
    const session = await getSession().catch(() => null);

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const setting = await getSiteSetting();

    return NextResponse.json(setting);
  } catch (error) {
    console.error("GET_SITE_SETTING_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengambil site settings" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession().catch(() => null);

    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSiteSettingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Data settings tidak valid",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const before = await getSiteSetting();

    const updated = await prisma.siteSetting.upsert({
      where: { id: DEFAULT_SITE_SETTING_ID },
      update: parsed.data,
      create: {
        id: DEFAULT_SITE_SETTING_ID,
        ...parsed.data,
      },
    });

    await writeAuditLog({
      action: "UPDATE",
      entityType: "SITE_SETTING",
      entityId: updated.id,
      description: "Mengupdate site settings Hirona",
      beforeData: before,
      afterData: updated,
    });

    await deleteCache("homepage:featured");
    await deleteCacheByPattern("catalog:*");
    await deleteCacheByPattern("product:detail:*");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE_SITE_SETTING_ERROR", error);
    return NextResponse.json(
      { message: "Gagal mengupdate site settings" },
      { status: 500 },
    );
  }
}
