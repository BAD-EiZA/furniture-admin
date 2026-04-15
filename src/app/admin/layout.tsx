import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Search, Bell, PanelLeft } from "lucide-react";

import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) redirect("/login");

  const isSuperAdmin = session.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)] text-slate-900">
      <div className="flex min-h-screen">
        <AdminSidebar isSuperAdmin={isSuperAdmin} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>

                  <SheetContent
                    side="left"
                    className="w-[86vw] max-w-[320px] border-r border-white/10 bg-transparent p-0 text-white"
                  >
                    <AdminSidebar isSuperAdmin={isSuperAdmin} mobile />
                  </SheetContent>
                </Sheet>

                <div className="relative hidden w-[320px] md:block">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Cari produk, order, user..."
                    className="rounded-2xl border-slate-200 bg-white pl-10 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="rounded-2xl">
                  <Bell className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {session.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden text-left md:block">
                        <p className="text-sm font-medium">{session.name}</p>
                        <p className="text-xs text-slate-500">{session.role}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 rounded-2xl">
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/products">Produk</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <form
                        action="/api/auth/logout"
                        method="post"
                        className="w-full"
                      >
                        <button type="submit" className="w-full text-left">
                          Logout
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}