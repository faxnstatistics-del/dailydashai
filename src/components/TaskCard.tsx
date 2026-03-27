"use client";

import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import type { Task } from "@/stores/task-store";
import { useTaskStore } from "@/stores/task-store";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { InteractiveCard } from "@/components/ui/motion";

const priorityOrder: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function PrioritySignal({ priority }: { priority: string }) {
  const level = priorityOrder[priority] ?? 2;
  return (
    <div
      className="flex items-center gap-0.5"
      title={`Priority: ${priority}`}
      aria-label={`Priority ${priority}`}
    >
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`h-1 w-1 rounded-full ${
            i <= level
              ? "bg-indigo-600 dark:bg-indigo-400"
              : "bg-zinc-200 dark:bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export default function TaskCard({ task, compact = false }: TaskCardProps) {
  const { completeTask } = useTaskStore();
  const [completing, setCompleting] = useState(false);
  const isCompleted = task.status === "completed";

  const handleComplete = async () => {
    if (isCompleted || completing) return;
    setCompleting(true);
    await completeTask(task.id);
    setCompleting(false);
  };

  if (compact) {
    return (
      <motion.div
        layout
        className={`group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-zinc-200/80 hover:bg-zinc-50/80 dark:hover:border-zinc-800 dark:hover:bg-zinc-800/40 ${
          isCompleted ? "opacity-55" : ""
        }`}
      >
        <button
          type="button"
          onClick={handleComplete}
          className="shrink-0 text-zinc-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          disabled={isCompleted || completing}
          aria-label={isCompleted ? "Completed" : "Mark complete"}
        >
          {completing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Circle className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
        <span
          className={`min-w-0 flex-1 text-sm font-medium ${
            isCompleted
              ? "text-zinc-400 line-through"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {task.title}
        </span>
        <PrioritySignal priority={task.priority} />
      </motion.div>
    );
  }

  return (
    <InteractiveCard className="surface-panel-hover rounded-xl border border-zinc-200/90 p-4 dark:border-zinc-800">
      <div
        className={`flex items-start gap-3 ${isCompleted ? "opacity-60" : ""}`}
      >
        <button
          type="button"
          onClick={handleComplete}
          className="mt-0.5 shrink-0 text-zinc-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          disabled={isCompleted || completing}
        >
          {completing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Circle className="h-5 w-5" strokeWidth={1.5} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h4
              className={`text-sm font-semibold tracking-tight ${
                isCompleted
                  ? "text-zinc-400 line-through"
                  : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              {task.title}
            </h4>
            <PrioritySignal priority={task.priority} />
            <span className="text-meta capitalize">{task.priority}</span>
          </div>

          {task.description && (
            <p className="text-meta mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="text-meta flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-zinc-400" />
              {task.estimatedMin} min
            </span>
            {task.dueDate && (
              <span>
                Due {format(new Date(task.dueDate), "MMM d, h:mm a")}
              </span>
            )}
            {task.goal && (
              <span className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400">
                <ChevronRight className="h-3 w-3" />
                {task.goal.title}
              </span>
            )}
          </div>
        </div>
      </div>
    </InteractiveCard>
  );
}
