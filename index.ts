import * as readline from "readline";
import { rowLetter, parseSeatPosition, findContiguousSegments } from "./helper";

// Maximum limits
const MAX_ROWS = 26;
const MAX_SEATS_PER_ROW = 50;

// A seat is defined by its row and column index (0-indexed)
interface Seat {
  row: number;
  col: number;
}

// A booking holds the booking id, movie title, and the list of seats confirmed.
interface Booking {
  id: string;
  movieTitle: string;
  seats: Seat[];
}

// Cinema class encapsulating seating and booking logic.
class Cinema {
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

// Define application states.
enum AppState {
  INIT,
  MAIN_MENU,
  BOOKING_FLOW,
  OVERRIDE_FLOW,
  CHECK_BOOKING,
  EXIT,
}

let currentState: AppState = AppState.INIT;
let cinema: Cinema | null = null;
let currentNumTickets: number = 0;
let currentBookingId: string = "";
let currentProvisionalAllocation: Seat[] = [];

// Create readline interface.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

// Helper to output a prompt.
function promptUser(message: string): void {
  process.stdout.write(message);
}

// --- State Handlers ---

// INIT: Get movie title and seating map.
function handleInit(input: string): void {
  const parts = input.trim().split(" ");
  if (parts.length < 3) {
    console.log(
      "Invalid input. Please follow the format: [Title] [Row] [SeatsPerRow]"
    );
    promptUser(
      "Please define movie title and seating map in [Title] [Row] [SeatsPerRow] format:\n> "
    );
    return;
  }
  const movieTitle = parts[0];
  const rows = Math.min(parseInt(parts[1]), MAX_ROWS);
  const seatsPerRow = Math.min(parseInt(parts[2]), MAX_SEATS_PER_ROW);
  cinema = new Cinema(movieTitle, rows, seatsPerRow);
  currentState = AppState.MAIN_MENU;
  displayMainMenu();
}

// MAIN_MENU: Display menu options.
function displayMainMenu(): void {
  if (!cinema) return;
  console.log(`\nWelcome to GIC Cinemas`);
  console.log(
    `[1] Book tickets for ${
      cinema.movieTitle
    } (${cinema.countAvailableSeats()} seats available)`
  );
  console.log("[2] Check bookings");
  console.log("[3] Exit");
  promptUser("Please enter your selection:\n> ");
}

// MAIN_MENU: Process selection.
function handleMainMenu(input: string): void {
  if (!cinema) return;
  const selection = input.trim();
  switch (selection) {
    case "1":
      currentState = AppState.BOOKING_FLOW;
      promptUser(
        "\nEnter number of tickets to book, or enter blank to go back to main menu:\n> "
      );
      break;
    case "2":
      currentState = AppState.CHECK_BOOKING;
      promptUser(
        "\nEnter booking id, or enter blank to go back to main menu:\n> "
      );
      break;
    case "3":
      currentState = AppState.EXIT;
      rl.close();
      break;
    default:
      console.log("Invalid selection, please try again.");
      displayMainMenu();
      break;
  }
}

// BOOKING_FLOW: Process number of tickets to book.
function handleBookingFlow(input: string): void {
  if (!cinema) return;
  const trimmed = input.trim();
  if (trimmed === "") {
    currentState = AppState.MAIN_MENU;
    displayMainMenu();
    return;
  }
  const numTickets = parseInt(trimmed);
  if (isNaN(numTickets) || numTickets <= 0) {
    console.log("Invalid number of tickets.");
    promptUser(
      "Enter number of tickets to book, or enter blank to go back to main menu:\n> "
    );
    return;
  }
  const available = cinema.countAvailableSeats();
  if (numTickets > available) {
    console.log(`Sorry, there are only ${available} seats available.`);
    promptUser(
      "Enter number of tickets to book, or enter blank to go back to main menu:\n> "
    );
    return;
  }
  currentNumTickets = numTickets;
  // Allocate default seats provisionally.
  currentProvisionalAllocation = cinema.allocateDefaultSeats(numTickets);
  cinema.markProvisional(currentProvisionalAllocation);
  currentBookingId = cinema.generateBookingId();
  console.log(
    `\nSuccessfully reserved ${numTickets} ${cinema.movieTitle} tickets.`
  );
  console.log(`Booking id: ${currentBookingId}`);
  console.log("Selected seats:");
  cinema.displaySeatingMap();
  currentState = AppState.OVERRIDE_FLOW;
  promptUser(
    "Enter blank to accept seat selection, or enter new seating position:\n> "
  );
}

// OVERRIDE_FLOW: Allow manual override or confirm selection.
function handleOverrideFlow(input: string): void {
  if (!cinema) return;
  const trimmed = input.trim();
  if (trimmed === "") {
    // Confirm booking.
    cinema.confirmBooking(currentProvisionalAllocation);
    console.log(`\nBooking id: ${currentBookingId} confirmed.`);
    cinema.bookings.push({
      id: currentBookingId,
      movieTitle: cinema.movieTitle,
      seats: currentProvisionalAllocation,
    });
    currentState = AppState.MAIN_MENU;
    displayMainMenu();
    return;
  }
  // Manual override.
  cinema.clearProvisional(currentProvisionalAllocation);
  const pos = parseSeatPosition(trimmed);
  if (!pos || pos.row >= cinema.rows || pos.col >= cinema.seatsPerRow) {
    console.log("Invalid seating position. Try again.");
    cinema.markProvisional(currentProvisionalAllocation);
    cinema.displaySeatingMap();
    promptUser(
      "Enter blank to accept seat selection, or enter new seating position:\n> "
    );
    return;
  }
  currentProvisionalAllocation = cinema.allocateManualSeats(
    currentNumTickets,
    pos.row,
    pos.col
  );
  cinema.markProvisional(currentProvisionalAllocation);
  console.log(`\nBooking id: ${currentBookingId}`);
  console.log("Selected seats:");
  cinema.displaySeatingMap();
  promptUser(
    "Enter blank to accept seat selection, or enter new seating position:\n> "
  );
}

// CHECK_BOOKING: Process booking id input and display the booking's seating map.
// Remains in CHECK_BOOKING state until the user enters blank.
function handleCheckBooking(input: string): void {
  if (!cinema) return;
  const trimmed = input.trim();
  if (trimmed === "") {
    currentState = AppState.MAIN_MENU;
    displayMainMenu();
    return;
  }
  const booking = cinema.bookings.find((b) => b.id === trimmed);
  if (booking) {
    console.log(`\nBooking id: ${booking.id}`);
    console.log("Selected seats:");
    cinema.displayBookingSeatingMap(booking);
  } else {
    console.log("Booking not found.");
  }
  promptUser("Enter booking id, or enter blank to go back to main menu:\n> ");
}

// Main input event handler.
rl.on("line", (input: string) => {
  switch (currentState) {
    case AppState.INIT:
      handleInit(input);
      break;
    case AppState.MAIN_MENU:
      handleMainMenu(input);
      break;
    case AppState.BOOKING_FLOW:
      handleBookingFlow(input);
      break;
    case AppState.OVERRIDE_FLOW:
      handleOverrideFlow(input);
      break;
    case AppState.CHECK_BOOKING:
      handleCheckBooking(input);
      break;
    default:
      break;
  }
});

// Start the application.
promptUser(
  "Please define movie title and seating map in [Title] [Row] [SeatsPerRow] format:\n> "
);

rl.on("close", () => {
  console.log("\nThank you for using GIC Cinemas. Goodbye!");
  process.exit(0);
});
