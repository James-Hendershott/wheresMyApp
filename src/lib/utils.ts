import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * WHY: Merge Tailwind classes safely without conflicts
 * HOW: clsx for conditional classes + twMerge to dedupe Tailwind utilities
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
