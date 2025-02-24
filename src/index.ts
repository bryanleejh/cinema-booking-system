import * as readline from "readline";
import { promptUser } from "./helper";
import { currentState, AppState } from "./appState";
import {
  handleInit,
  handleMainMenu,
  handleBookingFlow,
  handleOverrideFlow,
  handleCheckBooking,
} from "./handlers";

// Maximum limits
export const MAX_ROWS = 26;
export const MAX_SEATS_PER_ROW = 50;

// Create readline interface.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

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
