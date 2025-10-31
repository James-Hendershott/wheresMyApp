import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, QrCode, MapPin } from "lucide-react";

/**
 * WHY: Landing page introducing WheresMy App
 * WHAT: Hero section with navigation to main features
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="mx-auto max-w-4xl text-center">
        {/* Hero Section */}
        <div className="mb-8 flex justify-center">
          <Package className="h-24 w-24 text-blue-600" />
        </div>
        
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900">
          WheresMy App
        </h1>
        
        <p className="mb-8 text-xl text-gray-600">
          Track every storage tote, its location on real racks, and the items
          inside. Scan QR codes, check items in/out, and never lose track of
          your stuff again.
        </p>

        {/* Feature Cards */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<QrCode className="h-8 w-8" />}
            title="QR Scanning"
            description="Scan tote codes instantly with your phone camera"
          />
          <FeatureCard
            icon={<MapPin className="h-8 w-8" />}
            title="Visual Rack Map"
            description="See exactly where each container is located"
          />
          <FeatureCard
            icon={<Package className="h-8 w-8" />}
            title="Item Tracking"
            description="Check items in/out with photos and history"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/scan">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Scan QR Code
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

/**
 * WHAT: Reusable feature card component
 */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex justify-center text-blue-600">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
