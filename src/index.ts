import * as readline from "readline";
import { parseSeatPosition } from "./helper";
import { Cinema } from "./cinema";
import {
  cinema,
  currentState,
  AppState,
  currentNumTickets,
  currentProvisionalAllocation,
  currentBookingId,
  setCinema,
  setCurrentState,
  setCurrentNumTickets,
  setCurrentProvisionalAllocation,
  setCurrentBookingId,
} from "./appState";

// Maximum limits
const MAX_ROWS = 26;
const MAX_SEATS_PER_ROW = 50;

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
  setCinema(new Cinema(movieTitle, rows, seatsPerRow));
  setCurrentState(AppState.MAIN_MENU);
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
      setCurrentState(AppState.BOOKING_FLOW);
      promptUser(
        "\nEnter number of tickets to book, or enter blank to go back to main menu:\n> "
      );
      break;
    case "2":
      setCurrentState(AppState.CHECK_BOOKING);
      promptUser(
        "\nEnter booking id, or enter blank to go back to main menu:\n> "
      );
      break;
    case "3":
      setCurrentState(AppState.EXIT);
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
    setCurrentState(AppState.MAIN_MENU);
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
  setCurrentNumTickets(numTickets);
  // Allocate default seats provisionally.
  setCurrentProvisionalAllocation(cinema.allocateDefaultSeats(numTickets));
  cinema.markProvisional(currentProvisionalAllocation);
  setCurrentBookingId(cinema.generateBookingId());
  console.log(
    `\nSuccessfully reserved ${numTickets} ${cinema.movieTitle} tickets.`
  );
  console.log(`Booking id: ${currentBookingId}`);
  console.log("Selected seats:");
  cinema.displaySeatingMap();
  setCurrentState(AppState.OVERRIDE_FLOW);
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
    setCurrentState(AppState.MAIN_MENU);
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
  setCurrentProvisionalAllocation(
    cinema.allocateManualSeats(currentNumTickets, pos.row, pos.col)
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
    setCurrentState(AppState.MAIN_MENU);
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
