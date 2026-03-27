"use client";

import { useEffect, useState } from "react";
import { Plus, Target, Loader2, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { useGoalStore, type Goal } from "@/stores/goal-store";
import { useTaskStore } from "@/stores/task-store";
import GoalCard from "@/components/GoalCard";
import ProgressBar from "@/components/ProgressBar";
import CreateGoalModal from "@/components/CreateGoalModal";
import { format } from "date-fns";

function GoalDetailPanel({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const { completeTask } = useTaskStore();
  const { checkProgress } = useGoalStore();
  const [adapting, setAdapting] = useState(false);
  const [adaptation, setAdaptation] = useState<Record<string, unknown> | null>(null);

  const handleCheckProgress = async () => {
    setAdapting(true);
    try {
      const result = await checkProgress(goal.id);
      setAdaptation(result);
    } catch {
      // Error handled by store
    }
    setAdapting(false);
  };

  return (
    <div className="surface-panel-hover overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="border-b border-zinc-100 p-6 dark:border-zinc-800/80">
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-zinc-600 mb-2 flex items-center gap-1 transition-colors"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
              Back to goals
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {goal.title}
            </h2>
            {goal.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {goal.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
              <span className="uppercase tracking-wider font-medium">
                {goal.category}
              </span>
              <span>·</span>
              <span>Target: {format(new Date(goal.targetDate), "MMM d, yyyy")}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {Math.round(goal.progress)}%
            </span>
            <p className="text-xs text-zinc-400 mt-1">Complete</p>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={goal.progress} size="lg" showLabel />
        </div>

        <button
          type="button"
          onClick={handleCheckProgress}
          disabled={adapting}
          className="btn-primary mt-4 py-2 text-xs disabled:opacity-50"
        >
          {adapting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Target className="w-3.5 h-3.5" />
          )}
          AI Progress Check
        </button>
      </div>

      {/* Adaptation result */}
      {adaptation && (
        <div className="surface-inset mx-6 mb-4 rounded-xl border border-indigo-200/60 px-4 py-4 dark:border-indigo-500/20">
          <h3 className="text-label mb-2">AI assessment</h3>
          <p className="text-body text-sm">
            {(adaptation as { assessment?: { message?: string } }).assessment?.message}
          </p>
          {(adaptation as { motivation?: string }).motivation && (
            <p className="text-meta mt-2 italic text-zinc-600 dark:text-zinc-400">
              {(adaptation as { motivation?: string }).motivation}
            </p>
          )}
        </div>
      )}

      {/* Milestones */}
      <div className="p-6">
        <h3 className="text-label mb-4">Milestones &amp; tasks</h3>
        <div className="space-y-6">
          {goal.milestones.map((milestone) => {
            const msCompleted = milestone.tasks.filter(
              (t) => t.status === "completed"
            ).length;
            const msProgress =
              milestone.tasks.length > 0
                ? (msCompleted / milestone.tasks.length) * 100
                : 0;

            return (
              <div key={milestone.id}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60">
                    <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-200">
                      {milestone.weekNumber}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {milestone.title}
                    </h4>
                    {milestone.description && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">
                    {msCompleted}/{milestone.tasks.length}
                  </span>
                </div>

                <ProgressBar value={msProgress} size="sm" />

                <div className="mt-2 space-y-1 pl-9">
                  {milestone.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 py-1.5 group"
                    >
                      <button
                        onClick={() => completeTask(task.id)}
                        className="shrink-0 text-zinc-300 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-xs ${
                          task.status === "completed"
                            ? "line-through text-zinc-400"
                            : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMin}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const { goals, loading, fetchGoals } = useGoalStore();
  const { fetchTasks } = useTaskStore();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
    fetchTasks();
  }, [fetchGoals, fetchTasks]);

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label">Direction</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Goals
          </h1>
          <p className="text-body mt-2">
            Long-term targets, broken into milestones and tasks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGoalModalOpen(true)}
          className="btn-primary shrink-0"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New goal
        </button>
      </header>

      {selectedGoal ? (
        <GoalDetailPanel
          goal={selectedGoal}
          onClose={() => setSelectedGoalId(null)}
        />
      ) : goals.length === 0 ? (
        <div className="surface-panel rounded-2xl p-12 text-center">
          <Target className="mx-auto mb-4 h-12 w-12 text-zinc-200 dark:text-zinc-700" />
          <h3 className="text-title text-lg">No goals yet</h3>
          <p className="text-body mx-auto mt-2 mb-6 max-w-sm">
            Add one meaningful outcome — we&apos;ll map the path.
          </p>
          <button
            type="button"
            onClick={() => setGoalModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Create goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onViewDetails={(id) => setSelectedGoalId(id)}
            />
          ))}
        </div>
      )}

      <CreateGoalModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
      />
    </div>
  );
}
