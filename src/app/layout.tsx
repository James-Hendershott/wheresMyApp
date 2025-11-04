import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

// WHY: Inter font provides clean, modern typography
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Where's My...? - Inventory Tracking",
  description: "Track storage totes, items, and locations with QR codes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Where's My...?",
  },
};

// WHY: Next.js 14 expects viewport exported separately (not inside metadata)
export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
