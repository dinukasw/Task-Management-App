import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuthCookie } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { changePasswordSchema } from "@/validators/auth.schema";
import { updateUserPassword } from "@/services/auth.service";

export async function PUT(request: NextRequest) {
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
    const validatedData = changePasswordSchema.parse(body);

    // Update password
    await updateUserPassword(payload.userId, validatedData);

    // Return success
    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
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

      // Current password incorrect
      if (error.message === "Current password is incorrect") {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message || "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

