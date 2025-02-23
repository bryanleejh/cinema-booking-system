import { rowLetter, parseSeatPosition, findContiguousSegments } from "./helper";

describe("Helper Functions", () => {
  describe("rowLetter", () => {
    it("should return correct row letter for index 0", () => {
      expect(rowLetter(0)).toBe("A");
    });

    it("should return correct row letter for index 25", () => {
      expect(rowLetter(25)).toBe("Z");
    });
  });

  describe("parseSeatPosition", () => {
    it("should parse a valid seat position correctly", () => {
      const result = parseSeatPosition("B03");
      expect(result).toEqual({ row: 1, col: 2 });
    });

    it("should return null for invalid seat position", () => {
      expect(parseSeatPosition("ZZ99")).toBeNull();
      expect(parseSeatPosition("C0")).toBeNull();
      expect(parseSeatPosition("123")).toBeNull();
    });
  });

  describe("findContiguousSegments", () => {
    it("should find contiguous segments in a row", () => {
      const row = ["#", ".", ".", "#", ".", ".", ".", "#", "#"];
      const segments = findContiguousSegments(row);
      expect(segments).toEqual([
        { start: 1, length: 2 },
        { start: 4, length: 3 },
      ]);
    });

    it("should return empty array if no empty seats are found", () => {
      const row = ["#", "#", "#", "#", "#"];
      const segments = findContiguousSegments(row);
      expect(segments).toEqual([]);
    });

    it("should return the entire row if all seats are empty", () => {
      const row = [".", ".", ".", ".", "."];
      const segments = findContiguousSegments(row);
      expect(segments).toEqual([{ start: 0, length: 5 }]);
    });
  });
});
