import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// WHY: Inter font provides clean, modern typography
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WheresMy App",
  description: "Track storage totes, items, and locations with QR codes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WheresMy",
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
