// WHY: Consistent slot labeling across the app
// WHAT: Convert numeric row/col coordinates to A1-style labels (row 0 = A, col 1 = 1)
// HOW: Convert row to letter (0→A, 1→B, etc.), col to 1-indexed number

/**
 * Convert row number to letter(s)
 * 0 → A, 1 → B, ..., 25 → Z, 26 → AA, etc.
 */
export function rowToLetter(row: number): string {
  let result = "";
  let remaining = row;
  
  while (remaining >= 0) {
    result = String.fromCharCode(65 + (remaining % 26)) + result;
    remaining = Math.floor(remaining / 26) - 1;
    if (remaining < 0) break;
  }
  
  return result;
}

/**
 * Format slot position as A1-style label
 * @param row 0-indexed row number
 * @param col 0-indexed column number
 * @returns Formatted label like "A1", "B3", "AA12"
 */
export function formatSlotLabel(row: number, col: number): string {
  return `${rowToLetter(row)}${col + 1}`;
}
