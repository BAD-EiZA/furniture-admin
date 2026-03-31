import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import UserForm from "@/components/user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    notFound();
  }

  if (user.role === "SUPER_ADMIN") {
    redirect("/admin/users");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Edit User</h2>
        <p className="text-sm text-slate-500">Perbarui data admin atau sales</p>
      </div>

      <UserForm
        mode="edit"
        userId={user.id}
        initialValues={{
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          password: "",
          role: user.role as "ADMIN" | "SALES",
          isActive: user.isActive,
        }}
      />
    </div>
  );
}
