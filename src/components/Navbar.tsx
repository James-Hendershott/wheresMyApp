// WHY: Global navigation bar for easy access to main features
// WHAT: Navbar with links to Home, Inventory, Scan, and future features
// HOW: Client component using Next.js Link for fast navigation

"use client";
import Link from "next/link";
import { Package, QrCode, MapPin, Home } from "lucide-react";
import { AuthMenu } from "@/components/auth/AuthMenu";

export function Navbar() {
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-blue-600"
        >
          <Package className="h-6 w-6" />
          <span>Where&apos;s My...?</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
          >
            <Home className="h-5 w-5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            href="/locations"
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
          >
            <MapPin className="h-5 w-5" />
            <span className="hidden sm:inline">Locations</span>
          </Link>
          <Link
            href="/scan"
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
          >
            <QrCode className="h-5 w-5" />
            <span className="hidden sm:inline">Scan</span>
          </Link>
          <Link
            href="/containers"
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
          >
            <Package className="h-5 w-5" />
            <span className="hidden sm:inline">Containers</span>
          </Link>
          <div className="relative group">
            <button className="hidden items-center gap-1 text-gray-500 hover:text-blue-600 sm:flex">
              <span className="text-xs">Admin</span>
            </button>
            <div className="absolute right-0 hidden w-48 rounded border bg-white shadow-lg group-hover:block">
              <Link
                href="/admin/container-types"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Container Types
              </Link>
                <Link
                  href="/admin/migrate-containers"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Migrate Containers
                </Link>
              <Link
                href="/admin/pending-users"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Pending Users
              </Link>
              <Link
                href="/admin/seed-accounts"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Seed Test Accounts
              </Link>
            </div>
          </div>
          <AuthMenu />
        </div>
      </div>
    </nav>
  );
}
