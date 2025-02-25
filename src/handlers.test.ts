import { handleInit } from "./handlers";
import { AppState, setCinema, setCurrentState } from "./appState";
import { promptUser } from "./helper";

jest.mock("./appState");
jest.mock("./helper", () => ({
  promptUser: jest.fn(),
}));

describe("handleInit", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("should initialize cinema with valid input", async () => {
    const input = "Movie 10 10";
    handleInit(input);

    // Check that functions behave as expected for valid input
    expect(setCinema).toHaveBeenCalledTimes(1);
    expect(setCurrentState).toHaveBeenCalledWith(AppState.MAIN_MENU);
    expect(promptUser).not.toHaveBeenCalled();
  });

  it("should handle invalid input and prompt user for valid input", async () => {
    const input = "Movie 10"; // Invalid input with missing SeatsPerRow
    handleInit(input);

    // Ensure promptUser is called to ask for correct format
    expect(promptUser).toHaveBeenCalledWith(
      "Please define movie title and seating map in [Title] [Row] [SeatsPerRow] format:\n> "
    );
  });
});
