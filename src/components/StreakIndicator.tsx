"use client";

import { Flame } from "lucide-react";

interface StreakIndicatorProps {
  streak: number;
  label?: string;
}

export default function StreakIndicator({
  streak,
  label = "day streak",
}: StreakIndicatorProps) {
  const isActive = streak > 0;
  const isHot = streak >= 7;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium tabular-nums ${
        isHot
          ? "border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-100"
          : isActive
            ? "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            : "border-zinc-200/80 bg-white text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50"
      }`}
    >
      <Flame
        className={`h-3.5 w-3.5 shrink-0 ${
          isHot
            ? "text-indigo-600 dark:text-indigo-400"
            : isActive
              ? "text-zinc-500"
              : "text-zinc-300 dark:text-zinc-600"
        }`}
        strokeWidth={1.75}
      />
      <span>{streak}</span>
      <span className="font-normal text-zinc-500 dark:text-zinc-500">
        {label}
      </span>
    </div>
  );
}
