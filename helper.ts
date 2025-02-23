// Helper: Convert row index (0 = A) to letter.
export function rowLetter(row: number): string {
  return String.fromCharCode(65 + row);
}

// Helper: Parse a manual seating position string (e.g. "B03") into row and col.
export function parseSeatPosition(
  input: string
): { row: number; col: number } | null {
  input = input.trim().toUpperCase();
  if (!/^[A-Z]\d+$/.test(input)) return null;
  const row = input.charAt(0).charCodeAt(0) - 65;
  const col = parseInt(input.slice(1)) - 1;
  return { row, col };
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
