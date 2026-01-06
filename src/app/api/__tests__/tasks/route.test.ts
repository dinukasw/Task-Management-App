import { NextRequest } from "next/server";
import { GET, POST } from "../../tasks/route";
import { getTasks, createTask } from "@/services/task.service";
import { getAuthCookie } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { mockTask, mockTasks, mockTaskInput } from "@/__tests__/utils/mock-data";

jest.mock("@/services/task.service");
jest.mock("@/lib/cookies");
jest.mock("@/lib/jwt");

const mockGetTasks = getTasks as jest.MockedFunction<typeof getTasks>;
const mockCreateTask = createTask as jest.MockedFunction<typeof createTask>;
const mockGetAuthCookie = getAuthCookie as jest.MockedFunction<typeof getAuthCookie>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe("GET /api/tasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return tasks successfully", async () => {
    const token = "mock-token";
    const userId = "user-1";
    mockGetAuthCookie.mockResolvedValue(token);
    mockVerifyToken.mockResolvedValue({ userId, email: "test@example.com" });
    mockGetTasks.mockResolvedValue({
      tasks: mockTasks,
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const request = new NextRequest("http://localhost/api/tasks");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockTasks);
    expect(data.pagination).toEqual({
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
    expect(mockGetTasks).toHaveBeenCalledWith(userId, {
      page: 1,
      limit: 10,
      status: undefined,
      search: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  });

  it("should handle query parameters correctly", async () => {
    const token = "mock-token";
    const userId = "user-1";
    mockGetAuthCookie.mockResolvedValue(token);
    mockVerifyToken.mockResolvedValue({ userId, email: "test@example.com" });
    mockGetTasks.mockResolvedValue({
      tasks: [mockTasks[0]],
      total: 1,
      page: 2,
      limit: 5,
      totalPages: 1,
    });

    const request = new NextRequest(
      "http://localhost/api/tasks?page=2&limit=5&status=PENDING&search=Test&sortBy=title&sortOrder=asc"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetTasks).toHaveBeenCalledWith(userId, {
      page: 2,
      limit: 5,
      status: "PENDING",
      search: "Test",
      sortBy: "title",
      sortOrder: "asc",
    });
  });

  it("should return 401 if not authenticated", async () => {
    mockGetAuthCookie.mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/tasks");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Not authenticated");
  });

  it("should return 401 for invalid token", async () => {
    mockGetAuthCookie.mockResolvedValue("invalid-token");
    mockVerifyToken.mockRejectedValue(new Error("Invalid or expired token"));

    const request = new NextRequest("http://localhost/api/tasks");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid or expired token");
  });

  it("should validate pagination limits", async () => {
    const token = "mock-token";
    const userId = "user-1";
    mockGetAuthCookie.mockResolvedValue(token);
    mockVerifyToken.mockResolvedValue({ userId, email: "test@example.com" });
    mockGetTasks.mockResolvedValue({
      tasks: mockTasks,
      total: 3,
      page: 1,
      limit: 100,
      totalPages: 1,
    });

    const request = new NextRequest("http://localhost/api/tasks?limit=200");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetTasks).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        limit: 100, // Should be capped at 100
      })
    );
  });
});

describe("POST /api/tasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create task successfully", async () => {
    const token = "mock-token";
    const userId = "user-1";
    mockGetAuthCookie.mockResolvedValue(token);
    mockVerifyToken.mockResolvedValue({ userId, email: "test@example.com" });
    mockCreateTask.mockResolvedValue(mockTask);

    const request = new NextRequest("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify(mockTaskInput),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockTask);
    expect(mockCreateTask).toHaveBeenCalledWith(userId, mockTaskInput);
  });

  it("should return 401 if not authenticated", async () => {
    mockGetAuthCookie.mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify(mockTaskInput),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Not authenticated");
  });

  it("should return 400 for invalid input data", async () => {
    const token = "mock-token";
    const userId = "user-1";
    mockGetAuthCookie.mockResolvedValue(token);
    mockVerifyToken.mockResolvedValue({ userId, email: "test@example.com" });

    const request = new NextRequest("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        title: "AB", // Too short
        status: "PENDING",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid input data");
  });

  it("should return 401 for invalid token", async () => {
    mockGetAuthCookie.mockResolvedValue("invalid-token");
    mockVerifyToken.mockRejectedValue(new Error("Invalid or expired token"));

    const request = new NextRequest("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify(mockTaskInput),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid or expired token");
  });

  it("should handle missing request body", async () => {
    const token = "mock-token";
    const userId = "user-1";
    mockGetAuthCookie.mockResolvedValue(token);
    mockVerifyToken.mockResolvedValue({ userId, email: "test@example.com" });

    const request = new NextRequest("http://localhost/api/tasks", {
      method: "POST",
    });

    // This will throw an error when trying to parse JSON
    await expect(POST(request)).rejects.toThrow();
  });
});

