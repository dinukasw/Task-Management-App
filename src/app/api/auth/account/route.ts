import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuthCookie } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { deleteAccountSchema } from "@/validators/auth.schema";
import { deleteUser, verifyUserPassword } from "@/services/auth.service";
import { clearAuthCookie } from "@/lib/cookies";

export async function DELETE(request: NextRequest) {
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
    const validatedData = deleteAccountSchema.parse(body);

    // Verify password
    const isPasswordValid = await verifyUserPassword(payload.userId, validatedData.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 400 }
      );
    }

    // Delete user (tasks will be cascade deleted)
    await deleteUser(payload.userId);

    // Clear auth cookie
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
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
        { success: false, error: error.message || "Failed to delete account" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

