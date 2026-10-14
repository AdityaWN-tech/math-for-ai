"use client";

import { useSyncExternalStore } from "react";
import { type ProgressState, readProgress, STORAGE_KEY } from "@/lib/progress";

const EMPTY: ProgressState = { lessons: {}, xp: 0, streakDays: 0, lastActiveDate: null, badges: [], arcade: {}, updatedAt: 0 };

let cachedRaw: string | null | undefined;
let cachedState: ProgressState = EMPTY;

function subscribe(onChange: () => void) {
  window.addEventListener("m4ai:progress", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("m4ai:progress", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): ProgressState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* storage blocked: fall through to readProgress defaults */
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = readProgress();
  }
  return cachedState;
}

/** Live progress from localStorage. Server render (and the first client paint) see an empty profile. */
export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

const noop = () => () => {};

/** False during SSR and hydration, true afterwards. Use for anything date- or device-dependent. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
