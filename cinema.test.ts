import { Cinema } from "./cinema";
import { v4 as uuidv4 } from "uuid";

describe("Cinema Booking System", () => {
  let cinema: Cinema;

  beforeEach(() => {
    cinema = new Cinema("Inception", 5, 10);
  });

  test("should initialize cinema with correct seating map", () => {
    expect(cinema.getTitle()).toBe("Inception");
    expect(cinema.getAvailableSeats()).toBe(50);
  });

  test("should display correct initial seating map", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    cinema.displaySeatingMap();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Seating Map for Inception")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("A: . . . . . . . . . .")
    );
    consoleSpy.mockRestore();
  });

  test("should book seats and mark as current booking", () => {
    const bookingId = cinema.bookSeats([
      [4, 4],
      [4, 5],
    ]); // E5, E6
    const booking = cinema.getBookingById(bookingId);

    expect(booking).toBeDefined();
    expect(booking?.seats).toEqual(["E5", "E6"]);
    expect(cinema.getAvailableSeats()).toBe(48);
  });

  test("should finalize booking and mark seats as booked", () => {
    cinema.bookSeats([
      [4, 4],
      [4, 5],
    ]); // Book E5, E6
    cinema.displaySeatingMap();

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    cinema.displaySeatingMap();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("E: . . . . # # . . . .")
    );
    consoleSpy.mockRestore();
  });

  test("should not allow booking of already booked seats", () => {
    cinema.bookSeats([
      [4, 4],
      [4, 5],
    ]); // Book E5, E6
    const newBookingId = cinema.bookSeats([
      [4, 4],
      [4, 5],
    ]); // Try booking again

    const booking = cinema.getBookingById(newBookingId);
    expect(booking?.seats).toEqual([]); // No seats booked
  });

  test("should handle edge case of overbooking", () => {
    const allSeats = Array.from({ length: 50 }, (_, i) => [
      Math.floor(i / 10),
      i % 10,
    ]) as [number, number][];
    const bookingId = cinema.bookSeats(allSeats);

    expect(cinema.getAvailableSeats()).toBe(0);

    const overbookingId = cinema.bookSeats([[0, 0]]);
    const overbooking = cinema.getBookingById(overbookingId);
    expect(overbooking?.seats).toEqual([]); // No seats booked
  });

  test("should return undefined for invalid booking ID", () => {
    const invalidBooking = cinema.getBookingById(uuidv4());
    expect(invalidBooking).toBeUndefined();
  });
});
