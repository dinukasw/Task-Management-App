import { formatTaskDate } from "../date";
import { isToday, formatDistanceToNow, format } from "date-fns";

jest.mock("date-fns", () => ({
  isToday: jest.fn(),
  formatDistanceToNow: jest.fn(),
  format: jest.fn(),
}));

describe("Date Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("formatTaskDate", () => {
    it("should return relative time for today's dates", () => {
      const today = new Date();
      (isToday as jest.Mock).mockReturnValue(true);
      (formatDistanceToNow as jest.Mock).mockReturnValue("2 hours ago");

      const result = formatTaskDate(today);

      expect(isToday).toHaveBeenCalledWith(today);
      expect(formatDistanceToNow).toHaveBeenCalledWith(today, { addSuffix: true });
      expect(result).toBe("2 hours ago");
    });

    it("should return formatted date for past dates", () => {
      const pastDate = new Date("2024-01-15");
      (isToday as jest.Mock).mockReturnValue(false);
      (format as jest.Mock).mockReturnValue("Jan 15, 2024");

      const result = formatTaskDate(pastDate);

      expect(isToday).toHaveBeenCalledWith(pastDate);
      expect(format).toHaveBeenCalledWith(pastDate, "MMM d, yyyy");
      expect(result).toBe("Jan 15, 2024");
    });

    it("should handle string dates", () => {
      const dateString = "2024-01-15T10:00:00Z";
      const dateObj = new Date(dateString);
      (isToday as jest.Mock).mockReturnValue(false);
      (format as jest.Mock).mockReturnValue("Jan 15, 2024");

      const result = formatTaskDate(dateString);

      expect(isToday).toHaveBeenCalledWith(dateObj);
      expect(result).toBe("Jan 15, 2024");
    });

    it("should handle various relative time formats", () => {
      const today = new Date();
      (isToday as jest.Mock).mockReturnValue(true);
      (formatDistanceToNow as jest.Mock).mockReturnValue("5 minutes ago");

      const result = formatTaskDate(today);

      expect(result).toBe("5 minutes ago");
    });
  });
});

