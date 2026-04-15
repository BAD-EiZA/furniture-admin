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

  const content = (
    <div className="flex h-full min-h-0 flex-col bg-gradient-to-b from-[#0d2f57] via-[#125EA9] to-[#1f3f82] text-white">
      <div className="shrink-0 border-b border-white/10 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-white/95 shadow-md ring-1 ring-white/20 sm:h-12 sm:w-12">
            <Image
              src="/images/hirona-logo.png"
              alt="Hirona Logo"
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/70 sm:text-xs">
              Admin Panel
            </p>
            <h2 className="truncate text-base font-semibold text-white sm:text-lg">
              Hirona Homeware
            </h2>
          </div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
        <div className="space-y-2 pb-4">
          {filtered.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all duration-200 sm:px-4",
                  active
                    ? "bg-white text-[#125EA9] shadow-lg shadow-black/10"
                    : "text-white/85 hover:bg-white/12 hover:text-white",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                    active
                      ? "bg-[#eef4ff] text-[#125EA9]"
                      : "bg-white/10 text-white/85 group-hover:bg-white/15",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <span className="truncate font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );

  if (mobile) {
    return <div className="h-full min-h-0">{content}</div>;
  }

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 lg:block">
      <div className="sticky top-0 h-screen">{content}</div>
    </aside>
  );
}