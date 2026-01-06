import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuthCookie } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { taskSchema } from "@/validators/task.schema";
import { createTask, getTasks } from "@/services/task.service";

export async function GET() {
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

    // Get all tasks for the user
    const tasks = await getTasks(payload.userId);

    // Return tasks
    return NextResponse.json({
      success: true,
      data: tasks,
    });
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

