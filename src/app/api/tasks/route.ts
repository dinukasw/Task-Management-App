import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuthCookie } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { taskSchema } from "@/validators/task.schema";
import { createTask, getTasks } from "@/services/task.service";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = await getAuthCookie();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = await verifyToken(token);

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") as "PENDING" | "COMPLETED" | "CANCELED" | null;
    const search = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sortBy") || "createdAt") as "createdAt" | "status" | "title";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    // Get tasks with server-side filtering, sorting, and pagination
    const result = await getTasks(payload.userId, {
      page: validPage,
      limit: validLimit,
      status: status || undefined,
      search,
      sortBy,
      sortOrder,
    });

    // Return tasks with pagination metadata
    const response = NextResponse.json({
      success: true,
      data: result.tasks,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });

    // Add caching headers (short cache for user-specific data)
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );

    return response;
  } catch (error) {
    if (error instanceof Error) {
      // Token verification failed
      if (error.message === "Invalid or expired token") {
        return NextResponse.json(
          { success: false, error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message || "Failed to get tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = await getAuthCookie();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = await verifyToken(token);

    // Get request body
    const body = await request.json();

    // Validate input
    const validatedData = taskSchema.parse(body);

    // Create task
    const task = await createTask(payload.userId, validatedData);

    // Return created task
    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 201 }
    );
  } catch (error) {
    // Check if it's a validation error
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Token verification failed
      if (error.message === "Invalid or expired token") {
        return NextResponse.json(
          { success: false, error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message || "Failed to create task" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

