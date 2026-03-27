import { prisma } from "@/lib/db/prisma";
import { generateStructuredResponse } from "./client";
import {
  DAILY_BRIEFING_SYSTEM_PROMPT,
  buildBriefingUserPrompt,
} from "./prompts";
import { startOfDay, endOfDay, format } from "date-fns";

export interface BriefingData {
  greeting: string;
  date: string;
  prioritizedTasks: Array<{
    id: string;
    title: string;
    priority: string;
    estimatedMin: number;
    reason: string;
  }>;
  timeBlocks: Array<{
    startTime: string;
    endTime: string;
    activity: string;
    type: string;
  }>;
  warnings: Array<{
    type: string;
    message: string;
  }>;
  insight: string;
  stats: {
    totalTasks: number;
    totalEstimatedHours: number;
    highPriorityCount: number;
    eventsCount: number;
  };
}

/**
 * Post-process AI output to fix hallucinated stats/warnings.
 * The AI sometimes generates warnings that contradict its own stats.
 */
function validateBriefing(
  briefing: BriefingData,
  actualData: {
    taskCount: number;
    totalMinutes: number;
    highPriorityCount: number;
    eventCount: number;
  }
): BriefingData {
  const correctedHours = Math.round((actualData.totalMinutes / 60) * 10) / 10;

  // Override stats with actual computed values
  briefing.stats = {
    totalTasks: actualData.taskCount,
    totalEstimatedHours: correctedHours,
    highPriorityCount: actualData.highPriorityCount,
    eventsCount: actualData.eventCount,
  };

  // Filter out incorrect overload warnings
  briefing.warnings = briefing.warnings.filter((w) => {
    if (w.type === "overload" && correctedHours <= 8) return false;
    return true;
  });

  return briefing;
}

export async function generateDailyBriefing(
  userId: string
): Promise<BriefingData> {
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const [tasks, events, goals] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId,
        status: { in: ["pending", "in_progress"] },
        OR: [{ dueDate: { lte: dayEnd } }, { dueDate: null }],
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.calendarEvent.findMany({
      where: {
        userId,
        startTime: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.goal.findMany({
      where: { userId, status: "active" },
    }),
  ]);

  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMin, 0);
  const highPriorityCount = tasks.filter(
    (t) => t.priority === "high" || t.priority === "urgent"
  ).length;

  const userPrompt = buildBriefingUserPrompt({
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      estimatedMin: t.estimatedMin,
      dueDate: t.dueDate ? format(t.dueDate, "yyyy-MM-dd HH:mm") : null,
    })),
    events: events.map((e) => ({
      title: e.title,
      startTime: format(e.startTime, "HH:mm"),
      endTime: format(e.endTime, "HH:mm"),
      location: e.location,
    })),
    goals: goals.map((g) => ({
      title: g.title,
      progress: g.progress,
      targetDate: format(g.targetDate, "yyyy-MM-dd"),
    })),
    currentDate: format(today, "EEEE, MMMM d, yyyy"),
  });

  const result = await generateStructuredResponse(
    DAILY_BRIEFING_SYSTEM_PROMPT,
    userPrompt
  );

  const briefing = validateBriefing(result as unknown as BriefingData, {
    taskCount: tasks.length,
    totalMinutes,
    highPriorityCount,
    eventCount: events.length,
  });

  await prisma.briefing.create({
    data: {
      userId,
      date: dayStart,
      content: JSON.stringify(briefing),
    },
  });

  return briefing;
}
