import { handleInit } from "./handlers";
import { AppState, setCinema, setCurrentState } from "./appState";
import { promptUser } from "./helper";

jest.mock("./appState");
jest.mock("./helper"); // Mocking promptUser

describe("handleInit", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("should initialize cinema with valid input", () => {
    const input = "Movie 10 10";
    handleInit(input);

    expect(setCinema).toHaveBeenCalledTimes(1); // Check if setCinema was called
    expect(setCurrentState).toHaveBeenCalledWith(AppState.MAIN_MENU); // Check if current state was set to MAIN_MENU
    expect(promptUser).not.toHaveBeenCalled(); // Ensure promptUser is not called when the input is valid
  });

  it("should handle invalid input and prompt user for valid input", () => {
    const input = "Movie 10"; // Invalid format
    handleInit(input);

    // Check if promptUser was called with the correct message
    expect(promptUser).toHaveBeenCalledWith(
      "Please define movie title and seating map in [Title] [Row] [SeatsPerRow] format:\n> "
    );
  });
});
