// WHY: Container capacity tracking requires accurate volume calculations
// WHAT: Utilities for calculating container volumes from dimensions
// HOW: Uses trapezoidal prism formula for tapered containers, rectangular prism for boxes
// GOTCHA: All measurements must be in inches, results in cubic inches

/**
 * Calculate volume of a tapered container (tote/bin with top & bottom dimensions)
 * Uses trapezoidal prism formula: average of top and bottom areas × height
 * 
 * @param topLength - Top length in inches
 * @param topWidth - Top width in inches
 * @param bottomLength - Bottom length in inches
 * @param bottomWidth - Bottom width in inches
 * @param height - Height in inches
 * @returns Volume in cubic inches
 */
export function calculateTaperedVolume(
  topLength: number,
  topWidth: number,
  bottomLength: number,
  bottomWidth: number,
  height: number
): number {
  const topArea = topLength * topWidth;
  const bottomArea = bottomLength * bottomWidth;
  const averageArea = (topArea + bottomArea) / 2;
  return averageArea * height;
}

/**
 * Calculate volume of a rectangular container (box/suitcase with uniform dimensions)
 * 
 * @param length - Length in inches
 * @param width - Width in inches
 * @param height - Height in inches
 * @returns Volume in cubic inches
 */
export function calculateRectangularVolume(
  length: number,
  width: number,
  height: number
): number {
  return length * width * height;
}

/**
 * Calculate fill percentage based on item volumes vs container capacity
 * 
 * @param itemVolumes - Array of item volumes in cubic inches
 * @param containerCapacity - Container capacity in cubic inches
 * @returns Fill percentage (0-100+), clamped to 0 if capacity unknown
 */
export function calculateFillPercentage(
  itemVolumes: number[],
  containerCapacity: number | null | undefined
): number {
  if (!containerCapacity || containerCapacity === 0) return 0;
  
  const totalItemVolume = itemVolumes.reduce((sum, vol) => sum + vol, 0);
  return (totalItemVolume / containerCapacity) * 100;
}

/**
 * Get color class for capacity warnings
 * 
 * @param fillPercentage - Fill percentage (0-100+)
 * @returns Tailwind color class for visual feedback
 */
export function getCapacityColorClass(fillPercentage: number): string {
  if (fillPercentage >= 90) return "text-red-600 bg-red-50";
  if (fillPercentage >= 75) return "text-yellow-600 bg-yellow-50";
  return "text-green-600 bg-green-50";
}

/**
 * Get progress bar color for capacity display
 * 
 * @param fillPercentage - Fill percentage (0-100+)
 * @returns Tailwind background color class
 */
export function getCapacityProgressColor(fillPercentage: number): string {
  if (fillPercentage >= 90) return "bg-red-500";
  if (fillPercentage >= 75) return "bg-yellow-500";
  return "bg-green-500";
}

/**
 * Format volume for display with appropriate units
 * 
 * @param cubicInches - Volume in cubic inches
 * @returns Formatted string (e.g., "42.5 cu in" or "2.3 cu ft")
 */
export function formatVolume(cubicInches: number): string {
  if (cubicInches < 1000) {
    return `${cubicInches.toFixed(1)} cu in`;
  }
  const cubicFeet = cubicInches / 1728; // 12³ = 1728 cubic inches per cubic foot
  return `${cubicFeet.toFixed(2)} cu ft`;
}

/**
 * Get capacity warning message
 * 
 * @param fillPercentage - Fill percentage (0-100+)
 * @param addingVolume - Volume of item being added (optional)
 * @returns Warning message or null if no warning needed
 */
export function getCapacityWarning(
  fillPercentage: number,
  addingVolume?: number
): string | null {
  if (addingVolume && fillPercentage > 100) {
    return `⚠️ This container is already over capacity (${fillPercentage.toFixed(1)}%). Adding this item will exceed safe limits.`;
  }
  
  if (fillPercentage >= 100) {
    return `🚫 This container is at or over capacity (${fillPercentage.toFixed(1)}%). Consider moving some items.`;
  }
  
  if (fillPercentage >= 90) {
    return `⚠️ This container is nearly full (${fillPercentage.toFixed(1)}%). Limited space remaining.`;
  }
  
  if (fillPercentage >= 75) {
    return `📦 This container is filling up (${fillPercentage.toFixed(1)}%). Consider organizing soon.`;
  }
  
  return null;
}
