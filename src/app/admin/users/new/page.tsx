import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import UserForm from "@/components/user-form";

export default async function NewUserPage() {
  const session = await getSession();

  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Tambah User</h2>
        <p className="text-sm text-slate-500">
          Tambahkan akun admin atau sales
        </p>
      </div>

      <UserForm mode="create" />
    </div>
  );
}
