"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";
import { motion, AnimatePresence } from "framer-motion";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({
  open,
  onClose,
}: CreateTaskModalProps) {
  const { createTask } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    estimatedMin: 30,
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLoading(true);
    await createTask({
      ...form,
      dueDate: form.dueDate || null,
    });
    setLoading(false);
    setForm({
      title: "",
      description: "",
      priority: "medium",
      estimatedMin: 30,
      dueDate: "",
    });
    onClose();
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
              <div>
                <h2 className="text-title text-lg">New task</h2>
                <p className="text-meta mt-1">Add something to your list.</p>
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
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="What needs to be done?"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-label mb-2 block !normal-case tracking-normal">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Optional context…"
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-label mb-2 block !normal-case tracking-normal">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-label mb-2 block !normal-case tracking-normal">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={480}
                    value={form.estimatedMin}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estimatedMin: Number(e.target.value),
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="text-label mb-2 block !normal-case tracking-normal">
                  Due
                </label>
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !form.title.trim()}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2} />
                )}
                Create task
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
