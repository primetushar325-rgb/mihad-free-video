"use client";

// ============================================================
// Lightweight toast system (no external deps).
// Usage:  const { toast } = useToast();  toast.success("Saved!");
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warning: (m: string) => void;
}

const ToastContext = createContext<{ toast: ToastApi } | null>(null);

export function useToast(): { toast: ToastApi } {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful no-op when used outside provider (e.g. during SSR fallback)
    const noop = () => {};
    return {
      toast: { success: noop, error: noop, info: noop, warning: noop },
    };
  }
  return ctx;
}

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
  error: <XCircle className="h-5 w-5 text-red-400" />,
  info: <Info className="h-5 w-5 text-sky-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
};

const RING: Record<ToastType, string> = {
  success: "border-emerald-500/40",
  error: "border-red-500/40",
  info: "border-sky-500/40",
  warning: "border-amber-500/40",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const value = useMemo<{ toast: ToastApi }>(
    () => ({
      toast: {
        success: (m) => toast("success", m),
        error: (m) => toast("error", m),
        info: (m) => toast("info", m),
        warning: (m) => toast("warning", m),
      },
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-4 safe-top">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={`glass-strong pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-glass ${RING[t.type]}`}
            >
              <span className="mt-0.5 shrink-0">{ICONS[t.type]}</span>
              <p className="flex-1 text-sm leading-snug text-neutral-100">
                {t.message}
              </p>
              <button
                onClick={() => remove(t.id)}
                className="shrink-0 text-neutral-500 hover:text-neutral-200"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
