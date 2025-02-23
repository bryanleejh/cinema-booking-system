import * as readlineSync from "readline-sync";

// Constants
const MAX_ROWS = 26;
const MAX_SEATS_PER_ROW = 50;

interface Booking {
  id: number;
  movieTitle: string;
  bookedSeats: string[];
}

class Cinema {
  movieTitle: string;
  rows: number;
  seatsPerRow: number;
  seatingMap: string[][]; // Map of seating ('.' - available, 'o' - current booking, '#' - booked)
  bookings: Booking[] = [];
  bookingIdCounter: number = 1;

  constructor(movieTitle: string, rows: number, seatsPerRow: number) {
    this.movieTitle = movieTitle;
    this.rows = rows;
    this.seatsPerRow = seatsPerRow;
    this.seatingMap = this.createSeatingMap();
  }

  // Create seating map with all seats available ('.')
  createSeatingMap(): string[][] {
    const map: string[][] = [];
    for (let row = 0; row < this.rows; row++) {
      const rowSeats = Array(this.seatsPerRow).fill(".");
      map.push(rowSeats);
    }
    return map;
  }

  // Display the seating map
  displaySeatingMap(): void {
    console.log("Seating Map:");
    for (let i = 0; i < this.rows; i++) {
      console.log(`${i + 1}: ${this.seatingMap[i].join(" ")}`);
    }
  }

  // Book tickets and return booking ID
  bookTickets(numSeats: number): number | null {
    const availableSeats: { row: number; col: number }[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.seatsPerRow; col++) {
        if (this.seatingMap[row][col] === ".") {
          availableSeats.push({ row, col });
        }
      }
    }

    if (availableSeats.length < numSeats) {
      console.log("Not enough seats available. Please try again.");
      return null;
    }

    const selectedSeats = availableSeats.slice(0, numSeats);
    selectedSeats.forEach((seat) => {
      this.seatingMap[seat.row][seat.col] = "o";
    });

    const booking: Booking = {
      id: this.bookingIdCounter++,
      movieTitle: this.movieTitle,
      bookedSeats: selectedSeats.map(
        (seat) => `${seat.row + 1}-${seat.col + 1}`
      ),
    };

    this.bookings.push(booking);
    console.log(`Booking successful! Your booking ID is: ${booking.id}`);
    this.displaySeatingMap();
    return booking.id;
  }

  // Check booking by booking ID
  checkBooking(bookingId: number): void {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (booking) {
      console.log(`Booking ID: ${booking.id}`);
      console.log(`Movie Title: ${booking.movieTitle}`);
      console.log("Booked Seats: " + booking.bookedSeats.join(", "));
    } else {
      console.log("Booking not found.");
    }
  }
}

// Start application
function startCinemaSystem(): void {
  const movieTitleInput = readlineSync.question(
    "Please define movie title and seating map in [Title][Row][SeatsPerRow] format:\n> "
  );
  const [movieTitle, rows, seatsPerRow] = movieTitleInput.split(" ");
  const cinema = new Cinema(movieTitle, parseInt(rows), parseInt(seatsPerRow));

  let exit = false;
  while (!exit) {
    console.log("\nWelcome to GIC Cinemas");
    console.log(
      `[1] Book tickets for ${cinema.movieTitle} (${
        cinema.rows * cinema.seatsPerRow
      } seats available)`
    );
    console.log("[2] Check bookings");
    console.log("[3] Exit");
    const choice = readlineSync.question("Please enter your selection:\n> ");

    switch (choice) {
      case "1":
        const numTickets = readlineSync.questionInt(
          "Enter the number of tickets to book:\n> "
        );
        const bookingId = cinema.bookTickets(numTickets);
        if (bookingId) {
          console.log(`Tickets booked! Your booking ID is: ${bookingId}`);
        }
        break;
      case "2":
        const bookingIdToCheck = readlineSync.questionInt(
          "Enter your booking ID to check:\n> "
        );
        cinema.checkBooking(bookingIdToCheck);
        break;
      case "3":
        console.log("Thank you for using GIC Cinemas. Goodbye!");
        exit = true;
        break;
      default:
        console.log("Invalid selection, please try again.");
    }
  }
}

// Start the cinema system
startCinemaSystem();
