"use client";

import { useState } from "react";
import { X, Target, Loader2, Sparkles } from "lucide-react";
import { useGoalStore } from "@/stores/goal-store";
import { motion, AnimatePresence } from "framer-motion";

interface CreateGoalModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateGoalModal({
  open,
  onClose,
}: CreateGoalModalProps) {
  const { decomposeGoal, decomposing } = useGoalStore();
  const [form, setForm] = useState({
    title: "",
    description: "",
    targetDate: "",
    category: "personal",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetDate) return;

    try {
      await decomposeGoal({
        title: form.title,
        description: form.description || undefined,
        targetDate: form.targetDate,
        category: form.category,
      });
      setForm({
        title: "",
        description: "",
        targetDate: "",
        category: "personal",
      });
      onClose();
    } catch {
      // Error handled by store
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px]"
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            className="surface-panel relative z-10 w-full max-w-md p-6 shadow-xl"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                  <Target
                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                    strokeWidth={1.75}
                  />
                </div>
                <div>
                  <h2 className="text-title text-lg">New goal</h2>
                  <p className="text-meta mt-1 max-w-[240px] leading-relaxed">
                    AI breaks this into milestones and tasks you can track.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost rounded-lg"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-label mb-2 block !normal-case tracking-normal">
                  Goal
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Get consistent with training"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-label mb-2 block !normal-case tracking-normal">
                  Context (optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Constraints, starting point, success looks like…"
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label mb-2 block !normal-case tracking-normal">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="personal">Personal</option>
                    <option value="health">Health</option>
                    <option value="career">Career</option>
                    <option value="education">Education</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="text-label mb-2 block !normal-case tracking-normal">
                    Target date
                  </label>
                  <input
                    type="date"
                    value={form.targetDate}
                    onChange={(e) =>
                      setForm({ ...form, targetDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  decomposing || !form.title.trim() || !form.targetDate
                }
                className="btn-primary w-full disabled:opacity-50"
              >
                {decomposing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Planning…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                    Decompose with AI
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
