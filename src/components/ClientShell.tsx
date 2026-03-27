"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { initializeTheme } from "@/stores/theme-store";
import { PageTransition } from "@/components/ui/motion";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    if (pathname === "/") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-zinc-950/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      <main className="min-h-screen flex-1 lg:ml-64">
        <div className="surface-panel mx-3 mt-3 flex items-center justify-between px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="btn-ghost -ml-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-bold text-white">
              AI
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Briefing
            </span>
          </div>
          <span className="w-9" aria-hidden />
        </div>

        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <PageTransition key={pathname} className="mx-auto max-w-7xl">
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
