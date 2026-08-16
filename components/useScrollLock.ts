"use client";

import { useEffect } from "react";

let activeLocks = 0;

/** Reference-counted scroll lock. Every owner releases only its own lock. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    activeLocks += 1;
    document.documentElement.classList.add("is-scroll-locked");
    document.body.classList.add("is-scroll-locked");

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);
      if (activeLocks === 0) {
        document.documentElement.classList.remove("is-scroll-locked");
        document.body.classList.remove("is-scroll-locked");
      }
    };
  }, [locked]);
}
