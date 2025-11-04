// WHY: Render a small icon representing a container's type
// WHAT: Map known type names or icon keys to Lucide icons; fallback to Package

import * as Lucide from "lucide-react";
import { Box, Briefcase, Package, Archive } from "lucide-react";

export function ContainerTypeIcon({
  typeName,
  iconKey,
  className = "h-4 w-4 text-gray-600",
}: {
  typeName?: string | null;
  iconKey?: string | null;
  className?: string;
}) {
  const keyRaw = (iconKey || typeName || "");
  const key = keyRaw.toLowerCase();

  // Try dynamic lucide icon by name if provided
  if (iconKey) {
    // Convert to PascalCase (e.g., "package", "briefcase", "shopping-cart")
    const pascal = keyRaw
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(\w)/, (m) => m.toUpperCase());
    const Icon = (Lucide as Record<string, unknown>)[pascal] as
      | ((props: { className?: string; [k: string]: unknown }) => JSX.Element)
      | undefined;
    if (Icon) {
      return <Icon className={className} aria-label={pascal} />;
    }
  }
  // Simple mapping covering common cases in ROADMAP: 17/27/38 gallon totes, suitcase, box, bin, carry-on
  if (key.includes("suitcase") || key.includes("carry")) {
    return <Briefcase className={className} aria-label="Suitcase" />;
  }
  if (key.includes("box")) {
    return <Box className={className} aria-label="Box" />;
  }
  if (key.includes("bin")) {
    return <Archive className={className} aria-label="Bin" />;
  }
  if (key.includes("tote") || key.includes("gallon")) {
    return <Package className={className} aria-label="Tote" />;
  }
  return <Package className={className} aria-label="Container" />;
}
