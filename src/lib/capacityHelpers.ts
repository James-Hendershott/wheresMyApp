// WHY: Container capacity tracking needs helper functions for calculations
// WHAT: Helper functions to calculate and format container capacity information
// HOW: Uses volume data from items and container types to compute fill percentages
// GOTCHA: Returns safe defaults when capacity data is missing

import { calculateFillPercentage, getCapacityProgressColor, formatVolume } from "./volumeCalculations";

/**
 * Calculate capacity info for a container
 * @param containerCapacity - Container's capacity in cubic inches (from containerType)
 * @param items - Array of items with optional volume property
 * @returns Capacity information object
 */
export function calculateContainerCapacity(
  containerCapacity: number | null | undefined,
  items: Array<{ volume: number | null }>
) {
  // Filter out items without volume data
  const itemVolumes = items
    .map((item) => item.volume)
    .filter((vol): vol is number => vol !== null && vol !== undefined);

  const totalItemVolume = itemVolumes.reduce((sum, vol) => sum + vol, 0);
  const fillPercentage = calculateFillPercentage(itemVolumes, containerCapacity);
  const hasCapacityData = containerCapacity !== null && containerCapacity !== undefined && containerCapacity > 0;

  return {
    totalItemVolume,
    containerCapacity: containerCapacity || 0,
    fillPercentage,
    hasCapacityData,
    itemsWithVolume: itemVolumes.length,
    totalItems: items.length,
  };
}

/**
 * Get capacity display text
 * @param capacity - Capacity info from calculateContainerCapacity
 * @returns Display text for capacity
 */
export function getCapacityDisplayText(capacity: ReturnType<typeof calculateContainerCapacity>): string {
  if (!capacity.hasCapacityData) {
    return "Capacity tracking unavailable";
  }

  if (capacity.itemsWithVolume === 0) {
    return `0 / ${formatVolume(capacity.containerCapacity)} (0%)`;
  }

  return `${formatVolume(capacity.totalItemVolume)} / ${formatVolume(capacity.containerCapacity)} (${capacity.fillPercentage.toFixed(1)}%)`;
}

/**
 * Get capacity bar color class
 * @param fillPercentage - Fill percentage (0-100+)
 * @returns Tailwind color class
 */
export function getCapacityBarColor(fillPercentage: number): string {
  return getCapacityProgressColor(fillPercentage);
}
