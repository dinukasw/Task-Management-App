import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { loginSchema } from "@/validators/auth.schema";
import { loginUser } from "@/services/auth.service";
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
            validatedData = loginSchema.parse(body);
        } catch (validationError) {
            if (validationError instanceof ZodError) {
                // Provide more specific validation error messages
                const firstError = validationError.errors[0];
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
                { success: false, error: "Invalid email or password" },
                { status: 400 }
            );
        }

        // Login user
        const user = await loginUser(
            validatedData.email,
            validatedData.password
        );

        // Generate JWT token
        const token = await generateToken(user.id, user.email);

        // Set HTTP-only cookie
        await setAuthCookie(token);

        // Return user data (without password)
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            // Check if credentials are invalid
            if (error.message === "Invalid email or password") {
                return NextResponse.json(
                    { success: false, error: "Invalid email or password" },
                    { status: 401 }
                );
            }

            // Log unexpected errors for debugging (but don't expose details to client)
            console.error("Login error:", error);
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
