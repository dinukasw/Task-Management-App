import { generateToken, verifyToken } from "../jwt";

describe("JWT Utilities", () => {
  const userId = "user-1";
  const email = "test@example.com";

  describe("generateToken", () => {
    it("should generate a valid JWT token", async () => {
      const token = await generateToken(userId, email);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate different tokens for different users", async () => {
      const token1 = await generateToken("user-1", "user1@example.com");
      const token2 = await generateToken("user-2", "user2@example.com");

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token and return payload", async () => {
      const token = await generateToken(userId, email);
      const payload = await verifyToken(token);

      expect(payload.userId).toBe(userId);
      expect(payload.email).toBe(email);
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
    });

    it("should throw error for invalid token", async () => {
      const invalidToken = "invalid.token.here";

      await expect(verifyToken(invalidToken)).rejects.toThrow("Invalid or expired token");
    });

    it("should throw error for empty token", async () => {
      await expect(verifyToken("")).rejects.toThrow("Invalid or expired token");
    });

    it("should throw error for malformed token", async () => {
      await expect(verifyToken("not.a.valid.jwt.token")).rejects.toThrow(
        "Invalid or expired token"
      );
    });
  });

  describe("Token round-trip", () => {
    it("should generate and verify token correctly", async () => {
      const token = await generateToken(userId, email);
      const payload = await verifyToken(token);

      expect(payload.userId).toBe(userId);
      expect(payload.email).toBe(email);
    });
  });
});

