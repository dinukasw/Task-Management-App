import { NextRequest } from "next/server";
import { POST } from "../../auth/login/route";
import { loginUser } from "@/services/auth.service";
import { generateToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/cookies";
import { mockUser } from "@/__tests__/utils/mock-data";

jest.mock("@/services/auth.service");
jest.mock("@/lib/jwt");
jest.mock("@/lib/cookies");

const mockLoginUser = loginUser as jest.MockedFunction<typeof loginUser>;
const mockGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;
const mockSetAuthCookie = setAuthCookie as jest.MockedFunction<typeof setAuthCookie>;

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login user successfully", async () => {
    const token = "mock-jwt-token";
    mockLoginUser.mockResolvedValue(mockUser);
    mockGenerateToken.mockResolvedValue(token);
    mockSetAuthCookie.mockResolvedValue();

    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    });
    expect(mockLoginUser).toHaveBeenCalledWith("test@example.com", "password123");
    expect(mockGenerateToken).toHaveBeenCalledWith(mockUser.id, mockUser.email);
    expect(mockSetAuthCookie).toHaveBeenCalledWith(token);
  });

  it("should return 400 for invalid JSON", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: "invalid json",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Invalid request format");
  });

  it("should return 400 for invalid email", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email",
        password: "password123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("valid email address");
  });

  it("should return 400 for short password", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "12345",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("at least 6 characters");
  });

  it("should return 401 for invalid credentials", async () => {
    mockLoginUser.mockRejectedValue(new Error("Invalid email or password"));

    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid email or password");
  });

  it("should return 500 for unexpected errors", async () => {
    mockLoginUser.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toContain("unexpected error");
  });

  it("should handle missing request body", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

