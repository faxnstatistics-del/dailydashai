import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthenticatedUser } from "@/lib/db/get-user";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const goalId = searchParams.get("goalId");

    const where: Record<string, unknown> = { userId: user.id };
    if (status) where.status = status;
    if (goalId) where.goalId = goalId;

    const tasks = await prisma.task.findMany({
      where,
      include: { goal: true, milestone: true },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const goalId = body.goalId ?? null;
    const milestoneId = body.milestoneId ?? null;

    if (goalId) {
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, userId: user.id },
      });
      if (!goal) {
        return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
      }
    }
    if (milestoneId) {
      const ms = await prisma.milestone.findFirst({
        where: { id: milestoneId },
        include: { goal: true },
      });
      if (!ms || ms.goal.userId !== user.id) {
        return NextResponse.json({ error: "Invalid milestone" }, { status: 400 });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        priority: body.priority ?? "medium",
        estimatedMin: body.estimatedMin ?? 30,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        goalId,
        milestoneId,
        userId: user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
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
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "completed") {
        updateData.completedAt = new Date();
      }
    }
    if (data.estimatedMin !== undefined) updateData.estimatedMin = data.estimatedMin;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // If task belongs to a goal, recalculate goal progress
    if (task.goalId) {
      const goalTasks = await prisma.task.findMany({
        where: { goalId: task.goalId },
      });
      const completed = goalTasks.filter((t) => t.status === "completed").length;
      const progress = Math.round((completed / goalTasks.length) * 100);
      await prisma.goal.update({
        where: { id: task.goalId },
        data: {
          progress,
          status: progress === 100 ? "completed" : "active",
        },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
