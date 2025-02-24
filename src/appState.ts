// appState.ts

import { Cinema } from "./cinema";
import { Seat } from "./types";

export enum AppState {
  INIT,
  MAIN_MENU,
  BOOKING_FLOW,
  OVERRIDE_FLOW,
  CHECK_BOOKING,
  EXIT,
}

// Shared State Variables
export let currentState: AppState = AppState.INIT;
export let cinema: Cinema | null = null;
export let currentNumTickets: number = 0;
export let currentBookingId: string = "";
export let currentProvisionalAllocation: Seat[] = [];

export function setCurrentState(state: AppState): void {
  currentState = state;
}

export function setCinema(newCinema: Cinema): void {
  cinema = newCinema;
}

export function setCurrentNumTickets(num: number): void {
  currentNumTickets = num;
}

export function setCurrentBookingId(id: string): void {
  currentBookingId = id;
}

export function setCurrentProvisionalAllocation(seats: Seat[]): void {
  currentProvisionalAllocation = seats;
}
