// WHY: Global navigation bar for easy access to main features
// WHAT: Navbar with links to Home, Inventory, Scan, and future features
// HOW: Client component using Next.js Link for fast navigation

"use client";
import Link from "next/link";
import { Package, QrCode, MapPin, Home } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <Package className="h-6 w-6" />
          <span>WheresMy</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
            <Home className="h-5 w-5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link href="/racks" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
            <MapPin className="h-5 w-5" />
            <span className="hidden sm:inline">Inventory</span>
          </Link>
          <Link href="/scan" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
            <QrCode className="h-5 w-5" />
            <span className="hidden sm:inline">Scan</span>
          </Link>
          <Link href="/containers" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
            <Package className="h-5 w-5" />
            <span className="hidden sm:inline">Containers</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
