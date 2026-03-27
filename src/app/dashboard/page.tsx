"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  ListChecks,
  Target,
  CalendarDays,
  Clock,
  MapPin,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useTaskStore } from "@/stores/task-store";
import { useGoalStore } from "@/stores/goal-store";
import { useBriefingStore } from "@/stores/briefing-store";
import DailyBriefingPanel from "@/components/DailyBriefingPanel";
import BriefingModal from "@/components/BriefingModal";
import TaskCard from "@/components/TaskCard";
import GoalCard from "@/components/GoalCard";
import StreakIndicator from "@/components/StreakIndicator";
import CreateTaskModal from "@/components/CreateTaskModal";
import CreateGoalModal from "@/components/CreateGoalModal";
import { StaggerList, StaggerItem } from "@/components/ui/motion";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
}

function SchedulePanel() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : []))
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="surface-panel-hover flex h-full min-h-[280px] flex-col rounded-2xl">
      <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 dark:border-zinc-800/80">
        <div>
          <p className="text-label">Schedule</p>
          <h2 className="text-title mt-1 flex items-center gap-2 text-sm">
            <CalendarDays
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
              strokeWidth={1.75}
            />
            Today
          </h2>
        </div>
        <Link href="/schedule" className="link-accent inline-flex items-center gap-1 text-xs">
          Calendar
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600 dark:border-zinc-700 dark:border-t-indigo-400" />
          </div>
        ) : events.length === 0 ? (
          <div className="py-10 text-center">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-zinc-200 dark:text-zinc-700" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Nothing on the calendar today
            </p>
            <Link
              href="/schedule"
              className="link-accent mt-3 inline-block text-xs"
            >
              Add an event
            </Link>
          </div>
        ) : (
          <StaggerList className="space-y-3">
            {events.map((event) => (
              <StaggerItem key={event.id}>
                <div className="surface-inset flex gap-3 rounded-xl p-3">
                  <div className="w-0.5 shrink-0 rounded-full bg-indigo-500/80" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {event.title}
                    </p>
                    <div className="text-meta mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.startTime), "h:mm a")} –{" "}
                        {format(new Date(event.endTime), "h:mm a")}
                      </span>
                      {event.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </div>
    </div>
  );
}

function PanelHeader({
  label,
  title,
  icon: Icon,
  action,
}: {
  label: string;
  title: string;
  icon: LucideIcon;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5 dark:border-zinc-800/80">
      <div>
        <p className="text-label">{label}</p>
        <h2 className="text-title mt-1 flex items-center gap-2 text-sm">
          <Icon
            className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
            strokeWidth={1.75}
          />
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export default function DashboardPage() {
  const { tasks, fetchTasks } = useTaskStore();
  const { goals, fetchGoals } = useGoalStore();
  const { fetchBriefing } = useBriefingStore();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [briefingModalOpen, setBriefingModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchGoals();
    fetchBriefing();
  }, [fetchTasks, fetchGoals, fetchBriefing]);

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.status !== "completed").slice(0, 8),
    [tasks]
  );

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "active"),
    [goals]
  );

  const streak = useMemo(() => {
    const completedDates = tasks
      .filter((t) => t.completedAt)
      .map((t) => format(new Date(t.completedAt!), "yyyy-MM-dd"));
    const uniqueDates = [...new Set(completedDates)].sort().reverse();
    let count = 0;
    const today = format(new Date(), "yyyy-MM-dd");
    const checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      if (uniqueDates.includes(dateStr)) {
        count++;
      } else if (dateStr !== today) {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return count;
  }, [tasks]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="text-body mt-2">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StreakIndicator streak={streak} />
          <button
            type="button"
            onClick={() => setTaskModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New task
          </button>
        </div>
      </header>

      {/* 8px grid: gap-8 = 32px */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
        {/* Focal: briefing spans visual weight — min height aligns row rhythm */}
        <div className="min-h-[320px] lg:min-h-[360px]">
          <DailyBriefingPanel
            onOpenBriefing={() => setBriefingModalOpen(true)}
          />
        </div>

        <div className="surface-panel-hover flex min-h-[320px] flex-col rounded-2xl lg:min-h-[360px]">
          <PanelHeader
            label="Work"
            title="Tasks"
            icon={ListChecks}
            action={
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/tasks"
                  className="link-accent inline-flex items-center gap-1 text-xs"
                >
                  All
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-indigo-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-950/40"
                  aria-label="Add task"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            }
          />
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {todayTasks.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  You&apos;re clear for now
                </p>
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(true)}
                  className="link-accent mt-2 text-xs"
                >
                  Add a task
                </button>
              </div>
            ) : (
              <div className="surface-inset rounded-xl px-2 py-2">
                <StaggerList className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {todayTasks.map((task) => (
                    <StaggerItem key={task.id}>
                      <TaskCard task={task} compact />
                    </StaggerItem>
                  ))}
                </StaggerList>
              </div>
            )}
          </div>
        </div>

        <SchedulePanel />

        <div className="surface-panel-hover flex min-h-[280px] flex-col rounded-2xl">
          <PanelHeader
            label="Direction"
            title="Goals"
            icon={Target}
            action={
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/goals"
                  className="link-accent inline-flex items-center gap-1 text-xs"
                >
                  All
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-indigo-600 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-950/40"
                  aria-label="Add goal"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            }
          />
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeGoals.length === 0 ? (
              <div className="py-10 text-center">
                <Target className="mx-auto mb-3 h-10 w-10 text-zinc-200 dark:text-zinc-700" />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  No active goals
                </p>
                <p className="text-meta mx-auto mt-1 max-w-xs">
                  Set one target — we&apos;ll map milestones and tasks.
                </p>
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(true)}
                  className="btn-primary mt-5"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Create goal
                </button>
              </div>
            ) : (
              <StaggerList className="space-y-4">
                {activeGoals.map((goal) => (
                  <StaggerItem key={goal.id}>
                    <GoalCard goal={goal} />
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </div>
        </div>
      </div>

      <CreateTaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
      />
      <CreateGoalModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
      />
      <BriefingModal
        open={briefingModalOpen}
        onClose={() => setBriefingModalOpen(false)}
      />
    </div>
  );
}
