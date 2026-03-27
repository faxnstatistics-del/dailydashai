"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Filter, ListChecks, CheckCircle2 } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";
import TaskCard from "@/components/TaskCard";
import CreateTaskModal from "@/components/CreateTaskModal";
import { StaggerList, StaggerItem } from "@/components/ui/motion";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const priorityFilters = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function TasksPage() {
  const { tasks, loading, fetchTasks } = useTaskStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter)
        return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter]);

  const counts = useMemo(() => {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return { pending, inProgress, completed, total: tasks.length };
  }, [tasks]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label">Work</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Tasks
          </h1>
          <p className="text-body mt-2">Everything in one list, filtered how you need.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary shrink-0"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New task
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="surface-panel rounded-xl px-4 py-4 text-center">
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {counts.total}
          </p>
          <p className="text-label mt-1 !normal-case tracking-normal text-zinc-500">
            Total
          </p>
        </div>
        <div className="surface-panel rounded-xl px-4 py-4 text-center">
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {counts.pending}
          </p>
          <p className="text-label mt-1 !normal-case tracking-normal text-zinc-500">
            Pending
          </p>
        </div>
        <div className="surface-panel rounded-xl px-4 py-4 text-center">
          <p className="text-2xl font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
            {counts.inProgress}
          </p>
          <p className="text-label mt-1 !normal-case tracking-normal text-zinc-500">
            In progress
          </p>
        </div>
        <div className="surface-panel rounded-xl px-4 py-4 text-center">
          <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {counts.completed}
          </p>
          <p className="text-label mt-1 !normal-case tracking-normal text-zinc-500">
            Done
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
        <div className="flex gap-0.5 rounded-xl border border-zinc-200 bg-zinc-50/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/50">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                statusFilter === f.value
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        >
          {priorityFilters.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-zinc-300 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-panel rounded-2xl p-12 text-center">
          {tasks.length === 0 ? (
            <>
              <ListChecks className="mx-auto mb-4 h-12 w-12 text-zinc-200 dark:text-zinc-700" />
              <h3 className="text-title text-lg">No tasks yet</h3>
              <p className="text-body mt-2">Start with one small, concrete action.</p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-primary mt-6"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                Create task
              </button>
            </>
          ) : (
            <>
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-zinc-200 dark:text-zinc-700" />
              <h3 className="text-title text-lg">No matches</h3>
              <p className="text-body mt-2">Adjust filters to see more.</p>
            </>
          )}
        </div>
      ) : (
        <StaggerList className="space-y-3">
          {filtered.map((task) => (
            <StaggerItem key={task.id}>
              <TaskCard task={task} />
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      <CreateTaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
