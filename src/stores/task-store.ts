import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  estimatedMin: number;
  dueDate: string | null;
  completedAt: string | null;
  goalId: string | null;
  milestoneId: string | null;
  goal?: { id: string; title: string } | null;
  milestone?: { id: string; title: string } | null;
}

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (params?: Record<string, string>) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (params) => {
    set({ loading: true, error: null });
    try {
      const url = new URL("/api/tasks", window.location.origin);
      if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const tasks = await res.json();
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createTask: async (data) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      await get().fetchTasks();
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  updateTask: async (id, data) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      await get().fetchTasks();
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  completeTask: async (id) => {
    await get().updateTask(id, { status: "completed" });
  },
}));
