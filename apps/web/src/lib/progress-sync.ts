import type { ProgressState } from "@/lib/progress";
import { getDeviceId } from "@/lib/device-id";
import { readProgress } from "@/lib/progress";

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleProgressSync() {
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void pushProgressToServer();
  }, 2000);
}

export async function pushProgressToServer(): Promise<boolean> {
  const state = readProgress();
  const deviceId = getDeviceId();
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, state }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullProgressFromServer(): Promise<ProgressState | null> {
  const deviceId = getDeviceId();
  try {
    const res = await fetch(`/api/progress?deviceId=${encodeURIComponent(deviceId)}`);
    const data = await res.json();
    if (data.ok && data.state) return data.state as ProgressState;
  } catch {
    /* offline */
  }
  return null;
}
