"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login page gets its own layout (no sidebar/navbar)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  // Only show mobile navbar on dashboard page (/admin)
  const showMobileNavbar = pathname === "/admin";

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar - Always visible on desktop (≥1024px) */}
      <aside className="hidden lg:flex lg:w-56 border-r bg-muted/30 flex-shrink-0 flex-col">
        <div className="p-4 border-b">
          <Link href="/admin" className="font-bold text-lg">
            Admin Panel
          </Link>
          <p className="text-xs text-muted-foreground">RentaCar GT</p>
        </div>
        <nav className="p-2 flex-1">
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
        <div className="p-4 border-t space-y-3">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:underline block"
          >
            ← Volver al sitio
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors w-full"
          >
            <span>🚪</span>
            {loggingOut ? "Cerrando..." : "Cerrar Sesión"}
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Mobile/Tablet Top Navbar - Only on Dashboard and only < 1024px */}
        {showMobileNavbar && (
          <header className="lg:hidden border-b bg-white sticky top-0 z-40">
            <div className="h-16 px-4 flex items-center justify-center relative">
              {/* Mobile/Tablet Menu Button - Left side */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-md border bg-muted/30 hover:bg-muted transition-colors"
                aria-label="Abrir menú"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Logo - Centered */}
              <div className="text-center">
                <Link href="/admin" className="inline-block">
                  <h1 className="text-xl font-bold text-primary">
                    RentaCar GT
                  </h1>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </Link>
              </div>
            </div>
          </header>
        )}

        {/* Mobile/Tablet Fullscreen Menu Overlay - Only < 1024px */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel - Slides from left */}
            <div
              className={cn(
                "fixed inset-y-0 left-0 w-full bg-white z-50 flex flex-col lg:hidden",
                "animate-in slide-in-from-left duration-300"
              )}
            >
              {/* Header with Close Button */}
              <div className="h-16 px-4 flex items-center justify-between border-b">
                <div>
                  <h2 className="text-lg font-bold">Menú Dashboard</h2>
                  <p className="text-xs text-muted-foreground">RentaCar GT</p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                  aria-label="Cerrar menú"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-6 space-y-3">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-6 py-4 rounded-lg text-lg font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer Actions */}
              <div className="p-6 border-t space-y-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Volver al sitio
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors w-full"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">
                    {loggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
