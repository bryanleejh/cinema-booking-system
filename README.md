# Cinema Booking System

## Overview

This is a simple command-line-based cinema booking system that allows users to:

- Initialize a cinema with a movie title, number of rows, and seats per row.
- Book tickets and select seats (with options for default or manual selection).
- Check existing bookings using a booking ID.
- View the seating map with real-time seat availability.
- Exit the system gracefully.

## How to Run

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Run the Application**

   ```bash
   npm start
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

## Features

- **Initialization**: Define movie title and seating arrangement.
- **Main Menu Navigation**: Simple menu with booking, checking, and exiting options.
- **Ticket Booking**: Choose number of tickets, view seating arrangement, and manually override seat allocation.
- **Booking Confirmation**: Each booking gets a unique ID.
- **Check Booking**: Retrieve existing bookings using the booking ID.

## Design Choices

### 1. **State-Driven Handlers**

The system uses a state machine pattern where each user input transitions the app into a different state (e.g., `INIT`, `MAIN_MENU`, `BOOKING_FLOW`, `OVERRIDE_FLOW`, `CHECK_BOOKING`, `EXIT`). This makes user flow easier to manage and test.

### 2. **Cinema Class Abstraction**

The `Cinema` class handles all logic related to:

- Seating arrangement
- Booking seat allocations
- Displaying seating maps
- Managing bookings

This keeps the core logic isolated from user input/output handling.

### 3. **User Input Handling**

A `promptUser` helper function manages user inputs consistently across states. It allows for easy mocking during testing.

### 4. **Testability**

Handlers are designed to be pure functions where possible, making them easier to unit test. All side effects (like console logs and user prompts) are mockable.

## Assumptions

1. **Fixed Max Limits**: There are predefined maximum limits for rows and seats per row to avoid excessive allocations.
2. **Simple Input Format**: User inputs are kept simple (e.g., `Movie 10 10` for initialization) and minimal validation is done.
3. **No Persistence**: Bookings exist only during the runtime of the app. Exiting the app clears all bookings.
4. **Seat Allocation Strategy**:
   - **Default Allocation**: Seats are allocated starting from the front row, middle seats first.
   - **Manual Override**: Users can override the default allocation by specifying seat positions.
5. **Unique Booking IDs**: Each booking gets a simple, incrementing unique ID.
6. **Provisional Allocation**: Before confirmation, seat selections are provisional and can be overridden.

## Potential Improvements

- **Data Persistence**: Integrate a database or file storage to maintain bookings across sessions.
- **Error Handling**: More robust validation and error messaging.
- **Seat Preferences**: Allow users to specify seat preferences (e.g., aisle or back row).
- **Concurrency Handling**: Manage concurrent bookings to prevent race conditions in a real-world scenario.
