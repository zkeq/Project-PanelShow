"use client";

import { create } from "zustand";

interface TourStore {
  active: boolean;
  preloaded: boolean;
  stepIndex: number;
  preload: () => void;
  start: () => void;
  goTo: (index: number) => void;
  close: () => void;
}

export const useTourStore = create<TourStore>((set) => ({
  active: false,
  preloaded: false,
  stepIndex: 0,
  preload: () => {
    if (window.self === window.top) set({ preloaded: true });
  },
  start: () => {
    if (window.self === window.top) set({ active: true, preloaded: true, stepIndex: 0 });
  },
  goTo: (stepIndex) => set({ stepIndex }),
  close: () => set({ active: false }),
}));
