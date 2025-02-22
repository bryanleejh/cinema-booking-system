import { v4 as uuidv4 } from "uuid";

type Seat = "." | "#" | "o"; // '.' = Unbooked, '#' = Booked, 'o' = Current Booking

interface Booking {
  id: string;
  seats: string[];
}

export class Cinema {
  private title: string;
  private rows: number;
  private seatsPerRow: number;
  private seatingMap: Seat[][];
  private bookings: Booking[] = [];

  constructor(title: string, rows: number, seatsPerRow: number) {
    this.title = title;
    this.rows = rows;
    this.seatsPerRow = seatsPerRow;
    this.seatingMap = this.initializeSeating();
  }

  private initializeSeating(): Seat[][] {
    return Array.from({ length: this.rows }, () =>
      Array(this.seatsPerRow).fill(".")
    );
  }

  public getAvailableSeats(): number {
    return this.seatingMap.flat().filter((seat) => seat === ".").length;
  }

  public getTitle(): string {
    return this.title;
  }

  public displaySeatingMap(): void {
    console.log(`\nSeating Map for ${this.title}`);
    for (let i = 0; i < this.rows; i++) {
      const rowLabel = String.fromCharCode(65 + i); // A, B, C...
      const rowSeats = this.seatingMap[i].join(" ");
      console.log(`${rowLabel}: ${rowSeats}`);
    }
  }

  public bookSeats(seatPositions: [number, number][]): string {
    const bookingId = uuidv4();
    const bookedSeats: string[] = [];

    seatPositions.forEach(([row, col]) => {
      if (this.seatingMap[row][col] === ".") {
        this.seatingMap[row][col] = "o";
        bookedSeats.push(`${String.fromCharCode(65 + row)}${col + 1}`);
      }
    });

    this.bookings.push({ id: bookingId, seats: bookedSeats });
    this.finalizeBooking();
    return bookingId;
  }

  private finalizeBooking(): void {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.seatsPerRow; j++) {
        if (this.seatingMap[i][j] === "o") {
          this.seatingMap[i][j] = "#";
        }
      }
    }
  }

  public getBookingById(bookingId: string): Booking | undefined {
    return this.bookings.find((b) => b.id === bookingId);
  }
}
