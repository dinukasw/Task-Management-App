import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuthCookie } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { updateProfileSchema } from "@/validators/auth.schema";
import { updateUserProfile } from "@/services/auth.service";

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
    const validatedData = updateProfileSchema.parse(body);

    // Update user profile
    const user = await updateUserProfile(payload.userId, validatedData);

    // Return updated user
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
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

      // Email already exists
      if (error.message === "User with this email already exists") {
        return NextResponse.json(
          { success: false, error: "User with this email already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message || "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

