import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/types/prisma";
import { auth } from "@/lib/auth-session/auth";
import { hashPassword } from "better-auth/crypto";

/**
 * Helper to check if user is admin
 */
async function checkAdmin(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return session.user;
}

/**
 * PATCH /api/admin/dentists/[id]
 * Update a dentist's information including password
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdmin(request);
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      email,
      phone,
      specialization,
      qualifications,
      experience,
      password,
      confirmPassword,
    } = body;

    // Validate password if provided
    if (password) {
      if (password !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: "Passwords don't match" },
          { status: 400 }
        );
      }

      if (password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            error: "Password must be at least 8 characters long",
          },
          { status: 400 }
        );
      }

      // Update password manually using Prisma and better-auth hashing
      try {
        const hashedPassword = await hashPassword(password);

        // Update the password in the Account model (providerId: "credential")
        const accountUpdate = await prisma.account.updateMany({
          where: {
            userId: id,
            providerId: "credential",
          },
          data: { password: hashedPassword },
        });

        if (accountUpdate.count === 0) {
          // If no credential account exists, we might need to create one or handle it.
          // For now, we'll return an error if we can't find the account to update.
          return NextResponse.json(
            {
              success: false,
              error: "User does not have a credential account to update.",
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("Error setting password:", error);
        return NextResponse.json(
          { success: false, error: "Failed to update password" },
          { status: 500 }
        );
      }
    }

    // Update other user fields
    const updateData: {
      name?: string;
      email?: string;
      phone?: string | null;
      specialization?: string | null;
      qualifications?: string | null;
      experience?: number | null;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (specialization !== undefined)
      updateData.specialization = specialization || null;
    if (qualifications !== undefined)
      updateData.qualifications = qualifications || null;
    if (experience !== undefined) {
      updateData.experience = experience ? parseInt(String(experience)) : null;
    }

    // Only update if there are fields to update
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: {
          id,
          role: "dentist",
        },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Dentist updated successfully",
    });
  } catch (error) {
    console.error("[PATCH /api/admin/dentists/[id]] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode = errorMessage.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * DELETE /api/admin/dentists/[id]
 * Delete a dentist
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAdmin(request);
    const { id } = await params;

    await prisma.user.delete({
      where: {
        id,
        role: "dentist",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dentist deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/dentists/[id]] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode = errorMessage.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}
