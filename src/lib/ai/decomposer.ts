import { prisma } from "@/lib/db/prisma";
import { generateStructuredResponse } from "./client";
import {
  GOAL_DECOMPOSITION_SYSTEM_PROMPT,
  GOAL_ADAPTATION_SYSTEM_PROMPT,
  buildGoalDecompositionPrompt,
  buildGoalAdaptationPrompt,
} from "./prompts";
import { format, differenceInDays } from "date-fns";

export interface DecomposedGoal {
  goalAnalysis: {
    title: string;
    category: string;
    timelineWeeks: number;
    difficulty: string;
    successMetrics: string[];
  };
  milestones: Array<{
    weekNumber: number;
    title: string;
    description: string;
    tasks: Array<{
      title: string;
      description: string;
      estimatedMin: number;
      frequency: string;
      priority: string;
      dependencies: string[];
    }>;
  }>;
  weeklyPlan: Record<string, string[]>;
  adaptationRules: string[];
}

export async function decomposeGoal(data: {
  userId: string;
  title: string;
  description?: string;
  targetDate: string;
  category?: string;
}): Promise<{ goal: Record<string, unknown>; decomposition: DecomposedGoal }> {
  const userPrompt = buildGoalDecompositionPrompt({
    goal: data.title,
    description: data.description,
    targetDate: data.targetDate,
    category: data.category,
  });

  const result = await generateStructuredResponse(
    GOAL_DECOMPOSITION_SYSTEM_PROMPT,
    userPrompt
  );

  const decomposition = result as unknown as DecomposedGoal;

  // Persist the goal and its milestones/tasks
  const goal = await prisma.goal.create({
    data: {
      title: decomposition.goalAnalysis.title,
      description: data.description ?? null,
      category: decomposition.goalAnalysis.category,
      targetDate: new Date(data.targetDate),
      userId: data.userId,
    },
  });

  for (const milestone of decomposition.milestones) {
    const targetDate = new Date(data.targetDate);
    const msTargetDate = new Date(
      targetDate.getTime() -
        (decomposition.goalAnalysis.timelineWeeks - milestone.weekNumber) *
          7 *
          24 *
          60 *
          60 *
          1000
    );

    const createdMilestone = await prisma.milestone.create({
      data: {
        title: milestone.title,
        description: milestone.description,
        weekNumber: milestone.weekNumber,
        targetDate: msTargetDate,
        goalId: goal.id,
      },
    });

    for (const task of milestone.tasks) {
      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          estimatedMin: task.estimatedMin,
          userId: data.userId,
          goalId: goal.id,
          milestoneId: createdMilestone.id,
        },
      });
    }
  }

  return { goal, decomposition };
}

export async function adaptGoal(goalId: string, userId: string) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    include: {
      tasks: true,
      milestones: { include: { tasks: true } },
    },
  });

  if (!goal) throw new Error("Goal not found");

  const completedTasks = goal.tasks.filter((t) => t.status === "completed").length;
  const missedTasks = goal.tasks.filter((t) => t.status === "missed").length;
  const daysElapsed = differenceInDays(new Date(), goal.createdAt);
  const totalDays = differenceInDays(goal.targetDate, goal.createdAt);

  const recentCompleted = goal.tasks
    .filter((t) => t.status === "completed" && t.completedAt)
    .sort((a, b) => (b.completedAt!.getTime() - a.completedAt!.getTime()))
    .slice(0, 5)
    .map((t) => `Completed "${t.title}" on ${format(t.completedAt!, "MMM d")}`);

  const userPrompt = buildGoalAdaptationPrompt({
    goalTitle: goal.title,
    totalTasks: goal.tasks.length,
    completedTasks,
    missedTasks,
    currentProgress: goal.progress,
    daysElapsed,
    totalDays,
    recentActivity: recentCompleted,
  });

  const result = await generateStructuredResponse(
    GOAL_ADAPTATION_SYSTEM_PROMPT,
    userPrompt
  );

  // Update goal progress
  const newProgress = Math.round((completedTasks / Math.max(goal.tasks.length, 1)) * 100);
  await prisma.goal.update({
    where: { id: goalId },
    data: { progress: newProgress },
  });

  return result;
}
