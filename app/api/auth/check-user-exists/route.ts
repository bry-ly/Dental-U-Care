import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-session/auth";
import { prisma } from "@/lib/types/prisma";
import { headers } from "next/headers";

/**
 * Check if the currently signed-in user exists in the database
 * Used after Google OAuth to verify user exists before allowing access
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        { exists: false, error: "No session found" },
        { status: 401 }
      );
    }

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!existingUser) {
      // User doesn't exist (shouldn't happen if session exists, but safe to handle)
      await auth.api.signOut({
        headers: await headers(),
      });

      return NextResponse.json(
        {
          exists: false,
          error: "USER_NOT_FOUND",
          message: "No account found with this email address",
        },
        { status: 403 }
      );
    }

    // Check if the user was created recently (e.g., within the last 10 seconds)
    // This indicates they just signed up via the Login page, which we want to prevent
    const userCreatedAt = new Date(existingUser.createdAt).getTime();
    const now = Date.now();
    const isNewUser = now - userCreatedAt < 10000; // 10 seconds threshold

    if (isNewUser) {
      // User was just created, so we delete them to prevent "accidental" sign up
      await prisma.user.delete({
        where: { id: existingUser.id },
      });

      // Sign them out
      await auth.api.signOut({
        headers: await headers(),
      });

      return NextResponse.json(
        {
          exists: false,
          error: "USER_NOT_FOUND",
          message:
            "No account found with this email address. Please sign up first.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ exists: true, user: existingUser });
  } catch (error) {
    console.error("Error checking user existence:", error);
    return NextResponse.json(
      {
        exists: false,
        error: "SERVER_ERROR",
        message: "Failed to check user existence",
      },
      { status: 500 }
    );
  }
}
