import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthenticatedUser } from "@/lib/db/get-user";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const monthParam = searchParams.get("month");

    let start: Date;
    let end: Date;

    if (monthParam) {
      // Fetch entire month: ?month=2026-03
      const monthDate = new Date(monthParam + "-01");
      start = startOfMonth(monthDate);
      end = endOfMonth(monthDate);
    } else {
      const date = dateParam ? new Date(dateParam) : new Date();
      start = startOfDay(date);
      end = endOfDay(date);
    }

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: user.id,
        startTime: { gte: start, lte: end },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();

    const event = await prisma.calendarEvent.create({
      data: {
        title: body.title,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        location: body.location ?? null,
        userId: user.id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const owned = await prisma.calendarEvent.findFirst({
      where: { id, userId: user.id },
    });
    if (!owned) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.startTime !== undefined)
      updateData.startTime = new Date(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime);
    if (data.location !== undefined) updateData.location = data.location;

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("PATCH /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const owned = await prisma.calendarEvent.findFirst({
      where: { id, userId: user.id },
    });
    if (!owned) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.calendarEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
