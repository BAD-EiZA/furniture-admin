"use client";

import Link from "next/link";
import Image from "next/image";
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
        "w-72 shrink-0 border-r border-white/10 text-white",
        "bg-gradient-to-b from-[#0d2f57] via-[#125EA9] to-[#1f3f82]",
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
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/95 shadow-md ring-1 ring-white/20">
              <Image
                src="/images/hirona-logo.png"
                alt="Hirona Logo"
                fill
                className="object-contain p-1.5"
                priority
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                Admin Panel
              </p>
              <h2 className="truncate text-lg font-semibold text-white">
                Hirona Homeware
              </h2>
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
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-200",
                  active
                    ? "bg-white text-[#125EA9] shadow-lg shadow-black/10"
                    : "text-white/85 hover:bg-white/12 hover:text-white",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition",
                    active
                      ? "bg-[#eef4ff] text-[#125EA9]"
                      : "bg-white/10 text-white/85 group-hover:bg-white/15",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}