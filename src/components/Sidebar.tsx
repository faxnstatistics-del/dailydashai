"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  ListChecks,
  CalendarDays,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@/stores/theme-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/goals", label: "Goals", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <aside className="flex h-full flex-col border-r border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200/90 px-6 py-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-sm">
            AI
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Daily Briefing
            </h1>
            <p className="text-meta mt-0.5 truncate" title={session?.user?.email ?? undefined}>
              {session?.user?.email ?? "Signed in"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-100"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`}
                strokeWidth={1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200/90 p-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          <LogOut className="h-5 w-5 text-zinc-400" strokeWidth={1.75} />
          Sign out
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-zinc-400" strokeWidth={1.75} />
          ) : (
            <Moon className="h-5 w-5 text-zinc-400" strokeWidth={1.75} />
          )}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}
