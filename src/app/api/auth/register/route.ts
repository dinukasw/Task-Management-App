import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerSchema } from "@/validators/auth.schema";
import { registerUser } from "@/services/auth.service";
import { generateToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "Invalid request format. Please check your input." },
        { status: 400 }
      );
    }
    
    // Validate input
    let validatedData;
    try {
      validatedData = registerSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        // Provide more specific validation error messages
        const firstError = validationError.errors[0];
        if (firstError.path.includes("name")) {
          return NextResponse.json(
            { success: false, error: "Name must be at least 2 characters" },
            { status: 400 }
          );
        }
        if (firstError.path.includes("email")) {
          return NextResponse.json(
            { success: false, error: "Please enter a valid email address" },
            { status: 400 }
          );
        }
        if (firstError.path.includes("password")) {
          return NextResponse.json(
            { success: false, error: "Password must be at least 6 characters" },
            { status: 400 }
          );
        }
      }
      return NextResponse.json(
        { success: false, error: "Invalid input data. Please check all fields." },
        { status: 400 }
      );
    }

    // Register user
    const user = await registerUser(validatedData);

    // Generate JWT token
    const token = await generateToken(user.id, user.email);

    // Set HTTP-only cookie
    await setAuthCookie(token);

    // Return user data (without password)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      // Check if user already exists
      if (error.message === "User with this email already exists") {
        return NextResponse.json(
          { success: false, error: "User with this email already exists" },
          { status: 409 }
        );
      }

      // Log unexpected errors for debugging (but don't expose details to client)
      console.error("Registration error:", error);
      return NextResponse.json(
        { success: false, error: "An unexpected error occurred. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

