import { cookies } from "next/headers";
import { setAuthCookie, getAuthCookie, clearAuthCookie } from "../cookies";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("Cookie Utilities", () => {
  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
  });

  describe("setAuthCookie", () => {
    it("should set auth cookie with correct options", async () => {
      const token = "test-token";

      await setAuthCookie(token);

      expect(cookies).toHaveBeenCalled();
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "auth-token",
        token,
        expect.objectContaining({
          httpOnly: true,
          secure: false, // NODE_ENV is 'test' in jest.setup.ts
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        })
      );
    });
  });

  describe("getAuthCookie", () => {
    it("should return token if cookie exists", async () => {
      const token = "test-token";
      mockCookieStore.get.mockReturnValue({ value: token });

      const result = await getAuthCookie();

      expect(cookies).toHaveBeenCalled();
      expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
      expect(result).toBe(token);
    });

    it("should return null if cookie does not exist", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await getAuthCookie();

      expect(result).toBeNull();
    });

    it("should return null if cookie value is undefined", async () => {
      mockCookieStore.get.mockReturnValue({ value: undefined });

      const result = await getAuthCookie();

      expect(result).toBeNull();
    });
  });

  describe("clearAuthCookie", () => {
    it("should delete auth cookie", async () => {
      await clearAuthCookie();

      expect(cookies).toHaveBeenCalled();
      expect(mockCookieStore.delete).toHaveBeenCalledWith("auth-token");
    });
  });
});

