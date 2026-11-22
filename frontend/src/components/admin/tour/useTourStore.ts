"use client";

import { create } from "zustand";

interface TourStore {
  active: boolean;
  start: () => void;
  close: () => void;
}

export const useTourStore = create<TourStore>((set) => ({
  active: false,
  start: () => set({ active: true }),
  close: () => set({ active: false }),
}));
