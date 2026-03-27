import { create } from "zustand";

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  weekNumber: number;
  status: string;
  targetDate: string;
  completedAt: string | null;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    estimatedMin: number;
  }>;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  targetDate: string;
  progress: number;
  createdAt: string;
  milestones: Milestone[];
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
}

export interface DecompositionResult {
  goal: Record<string, unknown>;
  decomposition: {
    goalAnalysis: {
      title: string;
      category: string;
      timelineWeeks: number;
      difficulty: string;
      successMetrics: string[];
    };
    milestones: Array<{
      weekNumber: number;
      title: string;
      description: string;
      tasks: Array<{
        title: string;
        description: string;
        estimatedMin: number;
        frequency: string;
        priority: string;
        dependencies: string[];
      }>;
    }>;
    weeklyPlan: Record<string, string[]>;
    adaptationRules: string[];
  };
}

interface GoalStore {
  goals: Goal[];
  loading: boolean;
  decomposing: boolean;
  error: string | null;
  lastDecomposition: DecompositionResult | null;
  fetchGoals: () => Promise<void>;
  decomposeGoal: (data: {
    title: string;
    description?: string;
    targetDate: string;
    category?: string;
  }) => Promise<DecompositionResult>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  checkProgress: (goalId: string) => Promise<Record<string, unknown>>;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  loading: false,
  decomposing: false,
  error: null,
  lastDecomposition: null,

  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Failed to fetch goals");
      const goals = await res.json();
      set({ goals, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  decomposeGoal: async (data) => {
    set({ decomposing: true, error: null });
    try {
      const res = await fetch("/api/goals/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to decompose goal");
      const result = await res.json();
      set({ decomposing: false, lastDecomposition: result });
      await get().fetchGoals();
      return result;
    } catch (err) {
      set({ error: (err as Error).message, decomposing: false });
      throw err;
    }
  },

  updateGoal: async (id, data) => {
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      await get().fetchGoals();
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  checkProgress: async (goalId) => {
    try {
      const res = await fetch("/api/goals/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId }),
      });
      if (!res.ok) throw new Error("Failed to check progress");
      return await res.json();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },
}));
