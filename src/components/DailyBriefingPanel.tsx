"use client";

import {
  Sparkles,
  Clock,
  Loader2,
  ListChecks,
  Zap,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useBriefingStore } from "@/stores/briefing-store";
import { motion } from "framer-motion";

interface DailyBriefingPanelProps {
  onOpenBriefing: () => void;
}

export default function DailyBriefingPanel({
  onOpenBriefing,
}: DailyBriefingPanelProps) {
  const { briefing, loading, generating, generateBriefing } =
    useBriefingStore();

  const handleGenerate = async () => {
    onOpenBriefing();
    if (!briefing) {
      await generateBriefing();
    }
  };

  if (loading) {
    return (
      <div className="briefing-focal relative flex h-full min-h-[320px] items-center justify-center p-8">
        <Loader2 className="relative z-10 h-7 w-7 animate-spin text-indigo-500/70" />
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="briefing-focal relative flex h-full min-h-[320px] flex-col justify-between p-8">
        <div className="relative z-10">
          <p className="text-label text-indigo-700/80 dark:text-indigo-300/90">
            Daily briefing
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Plan your day with context
          </h2>
          <p className="text-body mt-2 max-w-sm text-zinc-600 dark:text-zinc-400">
            We&apos;ll synthesize tasks, your schedule, and goals into one
            clear plan.
          </p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={generating}
          className="relative z-10 mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              Generate briefing
            </>
          )}
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      layout
      onClick={onOpenBriefing}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="briefing-focal relative flex h-full min-h-[320px] w-full flex-col justify-between rounded-2xl p-8 text-left"
    >
      <div className="relative z-10">
        <p className="text-label text-indigo-700/80 dark:text-indigo-300/90">
          Daily briefing
        </p>
        <h2 className="mt-2 line-clamp-3 text-lg font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
          {briefing.greeting}
        </h2>
        <p className="text-meta mt-2 text-zinc-500 dark:text-zinc-400">
          {briefing.date}
        </p>
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-indigo-200/50 bg-white/60 px-2 py-2.5 text-center dark:border-indigo-500/20 dark:bg-zinc-900/40">
          <ListChecks className="mx-auto mb-1 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {briefing.stats.totalTasks}
          </p>
          <p className="text-[10px] font-medium text-zinc-500">Tasks</p>
        </div>
        <div className="rounded-xl border border-indigo-200/50 bg-white/60 px-2 py-2.5 text-center dark:border-indigo-500/20 dark:bg-zinc-900/40">
          <Clock className="mx-auto mb-1 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {briefing.stats.totalEstimatedHours}h
          </p>
          <p className="text-[10px] font-medium text-zinc-500">Est.</p>
        </div>
        <div className="rounded-xl border border-indigo-200/50 bg-white/60 px-2 py-2.5 text-center dark:border-indigo-500/20 dark:bg-zinc-900/40">
          <Zap className="mx-auto mb-1 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {briefing.stats.highPriorityCount}
          </p>
          <p className="text-[10px] font-medium text-zinc-500">Priority</p>
        </div>
        <div className="rounded-xl border border-indigo-200/50 bg-white/60 px-2 py-2.5 text-center dark:border-indigo-500/20 dark:bg-zinc-900/40">
          <Calendar className="mx-auto mb-1 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {briefing.stats.eventsCount}
          </p>
          <p className="text-[10px] font-medium text-zinc-500">Events</p>
        </div>
      </div>

      {briefing.warnings.length > 0 && (
        <div className="relative z-10 mt-4 flex items-start gap-2 rounded-xl border border-amber-200/60 bg-amber-50/90 px-3 py-2.5 dark:border-amber-500/25 dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="line-clamp-2 text-xs leading-relaxed text-amber-900 dark:text-amber-200/90">
            {briefing.warnings[0].message}
          </p>
        </div>
      )}

      <div className="relative z-10 mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300">
        <span>Open full briefing</span>
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </div>
    </motion.button>
  );
}
