import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          🚗 RentaCar GT
        </Link>
        <div className="flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Inicio
          </Link>
          <Link
            href="/flota"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Flota
          </Link>
        </div>
      </div>
    </nav>
  );
}
