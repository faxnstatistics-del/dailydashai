import { create } from "zustand";
import type { BriefingData } from "@/lib/ai/briefing";

interface BriefingStore {
  briefing: BriefingData | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  fetchBriefing: () => Promise<void>;
  generateBriefing: () => Promise<void>;
}

export const useBriefingStore = create<BriefingStore>((set) => ({
  briefing: null,
  loading: false,
  generating: false,
  error: null,

  fetchBriefing: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/briefing");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      set({ briefing: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  generateBriefing: async () => {
    set({ generating: true, error: null });
    try {
      const res = await fetch("/api/briefing", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}: Failed to generate`);
      }
      const data = await res.json();
      set({ briefing: data, generating: false });
    } catch (err) {
      set({ error: (err as Error).message, generating: false });
    }
  },
}));
