import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/types/prisma";
import { requireDentist } from "@/lib/auth-session/auth-server";

interface WorkingHours {
  [key: string]: {
    start?: string;
    end?: string;
    closed?: boolean;
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireDentist();
    const { id } = await params;

    // Verify the dentist is updating their own schedule
    if (user.id !== id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only update your own schedule" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { workingHours } = body as { workingHours: WorkingHours };

    if (!workingHours || typeof workingHours !== "object") {
      return NextResponse.json(
        { error: "Invalid working hours format" },
        { status: 400 }
      );
    }

    // Validate working hours structure
    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    for (const day of validDays) {
      if (workingHours[day]) {
        const dayHours = workingHours[day];
        if (dayHours.closed) {
          continue; // Closed days are valid
        }
        if (!dayHours.start || !dayHours.end) {
          return NextResponse.json(
            { error: `Missing start or end time for ${day}` },
            { status: 400 }
          );
        }
        // Validate time format (HH:mm)
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(dayHours.start) || !timeRegex.test(dayHours.end)) {
          return NextResponse.json(
            { error: `Invalid time format for ${day}. Use HH:mm format` },
            { status: 400 }
          );
        }
        // Validate start < end
        const [startHour, startMin] = dayHours.start.split(":").map(Number);
        const [endHour, endMin] = dayHours.end.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        if (startMinutes >= endMinutes) {
          return NextResponse.json(
            { error: `Start time must be before end time for ${day}` },
            { status: 400 }
          );
        }
      }
    }

    // Update dentist working hours
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        workingHours:
          workingHours as unknown as import("@prisma/client").Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      success: true,
      workingHours: updatedUser.workingHours,
    });
  } catch (error) {
    console.error("[PATCH /api/dentists/[id]/schedule] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dentist = await prisma.user.findUnique({
      where: { id, role: "dentist" },
      select: {
        id: true,
        name: true,
        workingHours: true,
        isAvailable: true,
      },
    });

    if (!dentist) {
      return NextResponse.json({ error: "Dentist not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      workingHours: dentist.workingHours,
      isAvailable: dentist.isAvailable,
    });
  } catch (error) {
    console.error("[GET /api/dentists/[id]/schedule] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
