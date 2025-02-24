import { Cinema } from "./cinema";
import { Seat } from "./types";

describe("Cinema Class", () => {
  let cinema: Cinema;

  beforeEach(() => {
    cinema = new Cinema("Test Movie", 5, 10); // 5 rows, 10 seats per row
  });

  test("should create a seating map with all seats available", () => {
    expect(cinema.seatingMap.length).toBe(5);
    cinema.seatingMap.forEach((row) => {
      expect(row).toEqual(Array(10).fill("."));
    });
  });

  test("should count available seats correctly", () => {
    expect(cinema.countAvailableSeats()).toBe(50); // 5 rows * 10 seats

    // Mark some seats as booked
    cinema.seatingMap[0][0] = "#";
    cinema.seatingMap[1][5] = "#";

    expect(cinema.countAvailableSeats()).toBe(48);
  });

  test("should generate unique booking IDs", () => {
    const id1 = cinema.generateBookingId();
    const id2 = cinema.generateBookingId();

    expect(id1).toBe("GIC0001");
    expect(id2).toBe("GIC0002");
  });

  test("should allocate default seats as close to center as possible", () => {
    const allocated = cinema.allocateDefaultSeats(4);
    expect(allocated.length).toBe(4);

    // Expect seats to be near center (col 4 or 5 in a 0-indexed 10-seat row)
    const cols = allocated.map((seat) => seat.col);
    const expectedCols = [3, 4, 5, 6]; // Example of center allocation
    expect(cols).toEqual(expectedCols);
  });

  test("should mark and clear provisional seats", () => {
    const allocation: Seat[] = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
    ];

    cinema.markProvisional(allocation);
    expect(cinema.seatingMap[0][0]).toBe("o");
    expect(cinema.seatingMap[0][1]).toBe("o");

    cinema.clearProvisional(allocation);
    expect(cinema.seatingMap[0][0]).toBe(".");
    expect(cinema.seatingMap[0][1]).toBe(".");
  });

  test("should confirm bookings", () => {
    const allocation: Seat[] = [
      { row: 2, col: 3 },
      { row: 2, col: 4 },
    ];

    cinema.confirmBooking(allocation);
    expect(cinema.seatingMap[2][3]).toBe("#");
    expect(cinema.seatingMap[2][4]).toBe("#");
  });

  test("should handle manual seat allocation with overflow", () => {
    // Block some seats to force overflow
    for (let i = 0; i < 9; i++) {
      cinema.seatingMap[0][i] = "#";
    }

    console.log(cinema.seatingMap[1]);

    const manualAllocation = cinema.allocateManualSeats(5, 0, 0);
    expect(manualAllocation.length).toBe(5);

    // First seat in row 0 should be at col 9, then overflow to row 1
    expect(manualAllocation[0]).toEqual({ row: 0, col: 9 });
    expect(manualAllocation[1]).toEqual({ row: 1, col: 3 });
    expect(manualAllocation[2]).toEqual({ row: 1, col: 4 });
    expect(manualAllocation[3]).toEqual({ row: 1, col: 5 });
    expect(manualAllocation[4]).toEqual({ row: 1, col: 6 });
  });

  test("should not allocate seats if there are not enough available", () => {
    // Block all seats
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 10; c++) {
        cinema.seatingMap[r][c] = "#";
      }
    }

    const allocation = cinema.allocateDefaultSeats(3);
    expect(allocation).toEqual([]);
  });
});
