"use client";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const sizeClasses = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
};

export default function ProgressBar({
  value,
  max = 100,
  size = "md",
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-meta font-medium">Progress</span>
          <span className="text-xs font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
            {percentage}%
          </span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-zinc-200/90 dark:bg-zinc-800 ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full bg-indigo-600 dark:bg-indigo-500 ${animated ? "transition-[width] duration-500 ease-out" : ""}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
