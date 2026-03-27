"use client";

import {
  Sparkles,
  Clock,
  AlertTriangle,
  TrendingUp,
  Loader2,
  RefreshCw,
  Calendar,
  ListChecks,
  Zap,
  X,
} from "lucide-react";
import { useBriefingStore } from "@/stores/briefing-store";
import type { BriefingData } from "@/lib/ai/briefing";
import { AnimatePresence, motion } from "framer-motion";

function TimeBlock({ block }: { block: BriefingData["timeBlocks"][number] }) {
  const isBreak = block.type === "break";
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
        isBreak
          ? "border-zinc-200/90 bg-zinc-50/90 dark:border-zinc-700 dark:bg-zinc-800/50"
          : "border-indigo-200/60 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-950/25"
      }`}
    >
      <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
        {block.startTime}–{block.endTime}
      </span>
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {block.activity}
      </span>
    </div>
  );
}

interface BriefingModalProps {
  open: boolean;
  onClose: () => void;
}

const easeOut = [0.4, 0, 0.2, 1] as [number, number, number, number];

export default function BriefingModal({ open, onClose }: BriefingModalProps) {
  const { briefing, generating, error, generateBriefing } =
    useBriefingStore();

  const handleGenerate = async () => {
    await generateBriefing();
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="briefing-modal"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 sm:py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className="absolute inset-0 bg-zinc-950/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: easeOut }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 mx-4 w-full max-w-md"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.26, ease: easeOut }}
          >
            {generating && !briefing && (
              <div className="surface-panel rounded-2xl p-12 text-center shadow-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/50">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-title text-lg">Generating your briefing</h2>
                <p className="text-body mt-2">
                  Pulling together tasks, schedule, and goals…
                </p>
              </div>
            )}

            {error && !generating && !briefing && (
              <div className="surface-panel rounded-2xl p-8 text-center shadow-xl">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-title text-lg">Couldn&apos;t generate</h2>
                <p className="text-body mt-2">{error}</p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="btn-primary"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {briefing && (
              <div className="surface-panel overflow-hidden rounded-2xl shadow-xl">
                <div className="relative border-b border-zinc-200/80 bg-gradient-to-b from-indigo-50/90 to-white px-6 py-5 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="text-label text-indigo-800/70 dark:text-indigo-300/80">
                    Daily briefing
                  </p>
                  <h2 className="text-title mt-1 pr-10 text-lg leading-snug">
                    {briefing.greeting}
                  </h2>
                  <p className="text-meta mt-1">{briefing.date}</p>

                  <div className="mt-5 grid grid-cols-4 gap-2">
                    <div className="rounded-xl border border-indigo-200/50 bg-white/70 px-2 py-2.5 text-center dark:border-indigo-500/15 dark:bg-zinc-900/50">
                      <ListChecks className="mx-auto mb-1 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-lg font-semibold tabular-nums">
                        {briefing.stats.totalTasks}
                      </p>
                      <p className="text-[10px] font-medium text-zinc-500">
                        Tasks
                      </p>
                    </div>
                    <div className="rounded-xl border border-indigo-200/50 bg-white/70 px-2 py-2.5 text-center dark:border-indigo-500/15 dark:bg-zinc-900/50">
                      <Clock className="mx-auto mb-1 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-lg font-semibold tabular-nums">
                        {briefing.stats.totalEstimatedHours}h
                      </p>
                      <p className="text-[10px] font-medium text-zinc-500">
                        Est.
                      </p>
                    </div>
                    <div className="rounded-xl border border-indigo-200/50 bg-white/70 px-2 py-2.5 text-center dark:border-indigo-500/15 dark:bg-zinc-900/50">
                      <Zap className="mx-auto mb-1 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-lg font-semibold tabular-nums">
                        {briefing.stats.highPriorityCount}
                      </p>
                      <p className="text-[10px] font-medium text-zinc-500">
                        Priority
                      </p>
                    </div>
                    <div className="rounded-xl border border-indigo-200/50 bg-white/70 px-2 py-2.5 text-center dark:border-indigo-500/15 dark:bg-zinc-900/50">
                      <Calendar className="mx-auto mb-1 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <p className="text-lg font-semibold tabular-nums">
                        {briefing.stats.eventsCount}
                      </p>
                      <p className="text-[10px] font-medium text-zinc-500">
                        Events
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-h-[52vh] space-y-5 overflow-y-auto p-6">
                  {briefing.warnings.length > 0 && (
                    <div className="space-y-2">
                      {briefing.warnings.map((warning, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded-xl border border-amber-200/70 bg-amber-50/90 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-950/25"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <p className="text-xs leading-relaxed text-amber-950 dark:text-amber-100/90">
                            {warning.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <h3 className="text-label mb-3 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Suggested schedule
                    </h3>
                    <div className="space-y-1.5">
                      {briefing.timeBlocks.map((block, i) => (
                        <TimeBlock key={i} block={block} />
                      ))}
                    </div>
                  </div>

                  <div className="surface-inset rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <h4 className="text-label mb-1 !normal-case !tracking-normal text-zinc-700 dark:text-zinc-300">
                          Insight
                        </h4>
                        <p className="text-body text-sm">{briefing.insight}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="link-accent inline-flex items-center gap-2 text-xs disabled:opacity-50"
                  >
                    {generating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-primary py-2 text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {!briefing && !generating && !error && (
              <div className="surface-panel rounded-2xl p-8 text-center shadow-xl">
                <Sparkles className="mx-auto mb-3 h-9 w-9 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-title text-lg">Today&apos;s briefing</h2>
                <p className="text-body mt-2">
                  Generate a plan from your tasks and calendar.
                </p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="btn-primary mt-6"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
