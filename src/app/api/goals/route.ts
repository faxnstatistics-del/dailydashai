import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthenticatedUser } from "@/lib/db/get-user";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        milestones: {
          include: { tasks: true },
          orderBy: { weekNumber: "asc" },
        },
        tasks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("GET /api/goals error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
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
      return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
    }

    const owned = await prisma.goal.findFirst({
      where: { id, userId: user.id },
    });
    if (!owned) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;

    const goal = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("PATCH /api/goals error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}
