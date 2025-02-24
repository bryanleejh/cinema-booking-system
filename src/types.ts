// A seat is defined by its row and column index (0-indexed)
export interface Seat {
  row: number;
  col: number;
}

// A booking holds the booking id, movie title, and the list of seats confirmed.
export interface Booking {
  id: string;
  movieTitle: string;
  seats: Seat[];
}
