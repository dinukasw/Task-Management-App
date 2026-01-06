import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { loginSchema } from "@/validators/auth.schema";
import { loginUser } from "@/services/auth.service";
import { generateToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/cookies";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = loginSchema.parse(body);

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
        // Check if it's a validation error
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, error: "Invalid email or password" },
                { status: 400 }
            );
        }

        if (error instanceof Error) {
            // Check if credentials are invalid
            if (error.message === "Invalid email or password") {
                return NextResponse.json(
                    { success: false, error: "Invalid email or password" },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { success: false, error: error.message || "Login failed" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: false, error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
