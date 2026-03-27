"use client";

import {
  Target,
  Calendar,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Wallet,
  User,
} from "lucide-react";
import { useState } from "react";
import type { Goal } from "@/stores/goal-store";
import ProgressBar from "./ProgressBar";
import { format } from "date-fns";
import { InteractiveCard } from "@/components/ui/motion";
import { motion, AnimatePresence } from "framer-motion";

const categoryIcons: Record<string, React.ReactNode> = {
  health: <Dumbbell className="h-4 w-4" strokeWidth={1.75} />,
  career: <Briefcase className="h-4 w-4" strokeWidth={1.75} />,
  education: <GraduationCap className="h-4 w-4" strokeWidth={1.75} />,
  finance: <Wallet className="h-4 w-4" strokeWidth={1.75} />,
  personal: <User className="h-4 w-4" strokeWidth={1.75} />,
};

interface GoalCardProps {
  goal: Goal;
  onViewDetails?: (goalId: string) => void;
}

export default function GoalCard({ goal, onViewDetails }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const completedTasks = goal.tasks.filter((t) => t.status === "completed")
    .length;
  const totalTasks = goal.tasks.length;
  const pct = Math.round(goal.progress);

  return (
    <InteractiveCard className="surface-panel-hover overflow-hidden rounded-xl border border-zinc-200/90 dark:border-zinc-800">
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
              {categoryIcons[goal.category] ?? (
                <Target className="h-4 w-4" strokeWidth={1.75} />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-title text-sm">{goal.title}</h3>
              <div className="text-meta mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="uppercase tracking-wide">{goal.category}</span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(goal.targetDate), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
              {pct}
              <span className="text-base font-medium text-zinc-400">%</span>
            </span>
          </div>
        </div>

        <ProgressBar value={goal.progress} size="md" />

        {/* Milestone strip — visual rhythm */}
        {goal.milestones.length > 0 && (
          <div className="mt-4 flex items-center gap-1.5">
            {goal.milestones.map((ms) => {
              const done =
                ms.tasks.length > 0 &&
                ms.tasks.every((t) => t.status === "completed");
              const inProgress =
                !done &&
                ms.tasks.some(
                  (t) =>
                    t.status === "completed" || t.status === "in_progress"
                );
              return (
                <div
                  key={ms.id}
                  className="flex flex-1 flex-col items-center gap-1"
                  title={ms.title}
                >
                  <div
                    className={`h-1.5 w-full rounded-full ${
                      done
                        ? "bg-indigo-600 dark:bg-indigo-500"
                        : inProgress
                          ? "bg-indigo-300 dark:bg-indigo-800"
                          : "bg-zinc-200 dark:bg-zinc-700"
                    }`}
                  />
                  <span className="text-[10px] font-medium tabular-nums text-zinc-400">
                    W{ms.weekNumber}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
          <span className="text-meta">
            {completedTasks}/{totalTasks} tasks done
          </span>
          <div className="flex items-center gap-1">
            {onViewDetails && (
              <button
                type="button"
                onClick={() => onViewDetails(goal.id)}
                className="link-accent text-xs"
              >
                Details
              </button>
            )}
            {goal.milestones.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="btn-ghost rounded-lg p-1.5"
                aria-expanded={expanded}
                aria-label={expanded ? "Collapse milestones" : "Expand milestones"}
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && goal.milestones.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-zinc-100 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-950/50"
          >
            <div className="space-y-3 px-5 py-4">
              <p className="text-label">Milestones</p>
              {goal.milestones.map((ms) => {
                const msTasks = ms.tasks.length;
                const msCompleted = ms.tasks.filter(
                  (t) => t.status === "completed"
                ).length;
                const msProgress =
                  msTasks > 0 ? (msCompleted / msTasks) * 100 : 0;
                return (
                  <div key={ms.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        Week {ms.weekNumber}: {ms.title}
                      </span>
                      <span className="shrink-0 text-meta tabular-nums">
                        {msCompleted}/{msTasks}
                      </span>
                    </div>
                    <ProgressBar value={msProgress} size="sm" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveCard>
  );
}
