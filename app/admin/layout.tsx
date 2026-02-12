"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/reservas", label: "Reservas", icon: "📋" },
  { href: "/admin/vehiculos", label: "Vehículos", icon: "🚗" },
  { href: "/admin/calendario", label: "Calendario", icon: "📅" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-muted/30 flex-shrink-0">
        <div className="p-4 border-b">
          <Link href="/admin" className="font-bold text-lg">
            Admin Panel
          </Link>
          <p className="text-xs text-muted-foreground">RentaCar GT</p>
        </div>
        <nav className="p-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
