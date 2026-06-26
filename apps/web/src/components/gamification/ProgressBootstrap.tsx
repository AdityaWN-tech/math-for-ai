"use client";

import { useEffect } from "react";
import { mergeRemoteProgress } from "@/lib/progress";
import { pullProgressFromServer } from "@/lib/progress-sync";

/** Pull server progress once on mount and merge into localStorage. */
export function ProgressBootstrap() {
  useEffect(() => {
    void pullProgressFromServer().then((remote) => {
      if (remote) mergeRemoteProgress(remote);
    });
  }, []);

  return null;
}
