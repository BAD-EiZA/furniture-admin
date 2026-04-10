"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileClock,
  BarChart3,
  ContactRound,
  Boxes,
  Settings,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Produk",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Riwayat Stok",
    href: "/admin/stock-history",
    icon: Boxes,
  },
  {
    label: "Pesanan",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Pengguna",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Log Audit",
    href: "/admin/audit-logs",
    icon: FileClock,
  },
  {
    label: "Analitik",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Pelanggan",
    href: "/admin/customers",
    icon: ContactRound,
  },
  {
    label: "Pengaturan Situs",
    href: "/admin/site-settings",
    icon: Settings,
    permission: "MANAGE_USERS",
  },
  {
    label: "Rekening Bank",
    href: "/admin/bank-accounts",
    icon: Landmark,
  },
];

export default function AdminSidebar({
  isSuperAdmin,
  mobile = false,
}: {
  isSuperAdmin: boolean;
  mobile?: boolean;
}) {
  const pathname = usePathname();

  const filtered = navItems.filter((item) => {
    if (
      (item.href === "/admin/users" || item.href === "/admin/audit-logs") &&
      !isSuperAdmin
    ) {
      return false;
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "w-72 shrink-0 border-r border-white/10 bg-slate-950 text-white",
        mobile ? "block" : "hidden lg:block",
      )}
    >
      <div
        className={cn(
          "flex flex-col",
          mobile ? "min-h-full" : "sticky top-0 h-screen",
        )}
      >
        <div className="border-b border-white/10 px-6 py-6">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 font-bold">
              FA
            </div>
            <div>
              <p className="text-sm text-slate-400">Admin Panel</p>
              <h2 className="text-lg font-semibold">Furniture App</h2>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {filtered.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all",
                  active
                    ? "bg-white text-slate-950 shadow-lg"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs text-slate-400">UI Style</p>
            <p className="mt-1 text-sm font-medium">shadcn + Kokonut vibe</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
