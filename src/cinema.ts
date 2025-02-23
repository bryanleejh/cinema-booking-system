import { Booking, Seat } from ".";
import { rowLetter, findContiguousSegments } from "./helper";

// Cinema class encapsulating seating and booking logic.
export class Cinema {
  movieTitle: string;
  rows: number;
  seatsPerRow: number;
  seatingMap: string[][]; // '.' available, 'o' provisional, '#' confirmed
  bookings: Booking[] = [];
  bookingCounter: number = 1;

  constructor(movieTitle: string, rows: number, seatsPerRow: number) {
    this.movieTitle = movieTitle;
    this.rows = rows;
    this.seatsPerRow = seatsPerRow;
    this.seatingMap = this.createSeatingMap();
  }

  createSeatingMap(): string[][] {
    const map: string[][] = [];
    for (let r = 0; r < this.rows; r++) {
      map.push(Array(this.seatsPerRow).fill("."));
    }
    return map;
  }

  countAvailableSeats(): number {
    let count = 0;
    for (const row of this.seatingMap) {
      count += row.filter((seat) => seat === ".").length;
    }
    return count;
  }

  // Display full seating map (rows printed in reverse order so that row A appears at the bottom).
  displaySeatingMap(): void {
    console.log("\nSCREEN");
    console.log("- ".repeat(this.seatsPerRow));
    for (let r = this.rows - 1; r >= 0; r--) {
      const rowLabel = rowLetter(r);
      const seatsStr = this.seatingMap[r].join("  ");
      console.log(`${rowLabel} ${seatsStr}`);
    }
    let seatNums = "  ";
    for (let i = 1; i <= this.seatsPerRow; i++) {
      seatNums += i.toString().padStart(2, " ") + " ";
    }
    console.log(seatNums + "\n");
  }

  // Helper to generate a temporary seating map for a booking.
  displayBookingSeatingMap(booking: Booking): void {
    // Clone the current seating map.
    const tempMap = this.seatingMap.map((row) => row.slice());
    // Overlay the booking's seats with 'o'.
    booking.seats.forEach((seat) => {
      tempMap[seat.row][seat.col] = "o";
    });
    console.log("\nSCREEN");
    console.log("-".repeat(this.seatsPerRow * 2 + 3));
    for (let r = this.rows - 1; r >= 0; r--) {
      const rowLabel = rowLetter(r);
      const seatsStr = tempMap[r].join("  ");
      console.log(`${rowLabel} ${seatsStr}`);
    }
    let seatNums = "   ";
    for (let i = 1; i <= this.seatsPerRow; i++) {
      seatNums += i.toString().padStart(2, " ") + " ";
    }
    console.log(seatNums + "\n");
  }

  markProvisional(allocation: Seat[]): void {
    allocation.forEach(({ row, col }) => {
      this.seatingMap[row][col] = "o";
    });
  }

  clearProvisional(allocation: Seat[]): void {
    allocation.forEach(({ row, col }) => {
      if (this.seatingMap[row][col] === "o") {
        this.seatingMap[row][col] = ".";
      }
    });
  }

  confirmBooking(allocation: Seat[]): void {
    allocation.forEach(({ row, col }) => {
      this.seatingMap[row][col] = "#";
    });
  }

  // Default allocation: start from the furthest row (A) and work downward.
  // In a row, choose a contiguous block whose center is as close as possible to the midpoint.
  // If one row can’t supply all required seats, overflow into the next row.
  allocateDefaultSeats(numSeats: number): Seat[] {
    let remaining = numSeats;
    const allocation: Seat[] = [];
    for (let r = 0; r < this.rows && remaining > 0; r++) {
      const seatsFromRow = this.allocateDefaultSeatsInRow(r, remaining);
      allocation.push(...seatsFromRow);
      remaining -= seatsFromRow.length;
    }
    return allocation;
  }

  allocateDefaultSeatsInRow(row: number, needed: number): Seat[] {
    const rowArr = this.seatingMap[row];
    const segments = findContiguousSegments(rowArr);
    if (segments.length === 0) return [];
    const rowCenter = (this.seatsPerRow - 1) / 2;
    let bestSegmentStart: number | null = null;
    let bestDistance = Infinity;
    for (const seg of segments) {
      if (seg.length >= needed) {
        for (
          let start = seg.start;
          start <= seg.start + seg.length - needed;
          start++
        ) {
          const blockCenter = start + (needed - 1) / 2;
          const distance = Math.abs(blockCenter - rowCenter);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestSegmentStart = start;
          }
        }
      }
    }
    if (bestSegmentStart !== null) {
      const allocation: Seat[] = [];
      for (let c = bestSegmentStart; c < bestSegmentStart + needed; c++) {
        allocation.push({ row, col: c });
      }
      return allocation;
    } else {
      const maxSeg = segments.reduce((prev, curr) =>
        curr.length > prev.length ? curr : prev
      );
      const allocation: Seat[] = [];
      for (let c = maxSeg.start; c < maxSeg.start + maxSeg.length; c++) {
        allocation.push({ row, col: c });
      }
      return allocation;
    }
  }

  // Manual override allocation: starting at the specified position, allocate consecutive seats,
  // then overflow into subsequent rows using default allocation.
  allocateManualSeats(
    numSeats: number,
    startRow: number,
    startCol: number
  ): Seat[] {
    let remaining = numSeats;
    const allocation: Seat[] = [];
    const rowArr = this.seatingMap[startRow];
    let c = startCol;
    while (c < this.seatsPerRow && rowArr[c] !== ".") {
      c++;
    }
    while (c < this.seatsPerRow && remaining > 0 && rowArr[c] === ".") {
      allocation.push({ row: startRow, col: c });
      remaining--;
      c++;
    }
    for (let r = startRow + 1; r < this.rows && remaining > 0; r++) {
      const seatsFromRow = this.allocateDefaultSeatsInRow(r, remaining);
      allocation.push(...seatsFromRow);
      remaining -= seatsFromRow.length;
    }
    return allocation;
  }

  // Generate a booking id (e.g., GIC0001, GIC0002).
  generateBookingId(): string {
    const id = "GIC" + this.bookingCounter.toString().padStart(4, "0");
    this.bookingCounter++;
    return id;
  }
}
