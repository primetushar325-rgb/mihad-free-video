"use client";

// ============================================================
// Reusable Modal with backdrop, escape-to-close, and focus styles.
// ============================================================

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useScrollLock } from "@/components/useScrollLock";

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const maxW =
    size === "lg" ? "max-w-3xl" : size === "sm" ? "max-w-sm" : "max-w-xl";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`glass-strong relative z-10 max-h-[92dvh] w-full ${maxW} touch-pan-y overflow-y-auto overscroll-contain rounded-t-3xl border border-gold-500/20 p-5 shadow-gold sm:rounded-3xl`}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
