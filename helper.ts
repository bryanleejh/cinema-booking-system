// Helper: Convert row index (0 = A) to letter.
export function rowLetter(row: number): string {
  return String.fromCharCode(65 + row);
}

// Helper: Parse a manual seating position string (e.g. "B03") into row and col.
export function parseSeatPosition(
  input: string
): { row: number; col: number } | null {
  input = input.trim().toUpperCase();

  // Validate row (should be a single letter A-Z)
  const rowMatch = /^[A-Z]$/.test(input.charAt(0));
  if (!rowMatch) return null;

  const row = input.charCodeAt(0) - 65; // Convert letter to index (A = 0, B = 1, ..., Z = 25)

  // Validate column (should be digits following the row letter)
  const col = parseInt(input.slice(1));
  if (isNaN(col) || col < 1 || col > 50) return null;

  // Return the parsed seat position
  return { row, col: col - 1 }; // Convert column to 0-based index
}

// Helper: Find contiguous segments of available seats ('.') in a row.
export function findContiguousSegments(
  rowArr: string[]
): { start: number; length: number }[] {
  const segments: { start: number; length: number }[] = [];
  let i = 0;
  while (i < rowArr.length) {
    if (rowArr[i] === ".") {
      const start = i;
      let length = 0;
      while (i < rowArr.length && rowArr[i] === ".") {
        length++;
        i++;
      }
      segments.push({ start, length });
    } else {
      i++;
    }
  }
  return segments;
}
