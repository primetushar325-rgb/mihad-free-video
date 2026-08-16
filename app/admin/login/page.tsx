"use client";

// ============================================================
// Admin login page.
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Loader2, LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await api.post("/api/auth/login", { username, password });
      toast.success("Welcome back!");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      const e = err as ApiError;
      if (e.status === 400 && e.errors) setErrors(e.errors);
      toast.error(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[100svh] touch-pan-y items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-strong w-full max-w-sm rounded-3xl border border-gold-500/20 p-7 shadow-gold"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-gradient text-2xl font-black text-black shadow-gold">
            M
          </div>
          <h1 className="font-display text-xl font-extrabold text-gold-gradient">
            Admin Login
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Sign in to manage Mihad Free Video
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                    className={`field pl-10 ${errors.username ? "field-error" : ""}`}
                autoComplete="username"
                placeholder="admin"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-red-400">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`field pl-10 ${errors.password ? "field-error" : ""}`}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Sign in
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-gold-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
