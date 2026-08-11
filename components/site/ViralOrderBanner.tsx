"use client";

// ============================================================
// ViralOrderBanner — a big, eye-catching animated banner.
// "100% ভিডিও ভাইরাল হবে — অর্ডার করতে এখানে ক্লিক করুন"
// Clicking it opens the given link (https://boom-shorts-website.vercel.app/)
// in a new tab. Uses framer-motion + CSS pulses so it stands out
// the moment the site loads.
// ============================================================

import { motion } from "framer-motion";
import { Flame, Sparkles, ArrowRight, TrendingUp } from "lucide-react";

const ORDER_URL = "https://boom-shorts-website.vercel.app/";

export default function ViralOrderBanner() {
  return (
    <motion.a
      href={ORDER_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative mx-auto block max-w-7xl overflow-hidden rounded-3xl border border-gold-500/40 px-3 pt-4 sm:px-5"
    >
      <div className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 px-5 py-6 text-center sm:flex-row sm:gap-6 sm:py-8">
        {/* animated glow blobs */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-6 h-44 w-44 rounded-full bg-yellow-200/40 blur-2xl" />
        {/* moving shine sweep */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shine_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* icon */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/95 shadow-xl"
        >
          <Flame className="h-9 w-9 text-orange-500" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[9px] font-black text-amber-400">
            100
          </span>
        </motion.div>

        {/* text */}
        <div className="relative text-white">
          <p className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-yellow-100 sm:justify-start">
            <Sparkles className="h-3.5 w-3.5" /> Trending · Limited Offer
          </p>
          <h2 className="mt-1 font-display text-xl font-black leading-tight drop-shadow sm:text-3xl">
            100% ভিডিও ভাইরাল হবে!
          </h2>
          <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">
            অর্ডার করতে নিচের বাটনে ক্লিক করুন — এখনই সুযোগটা নিন 🔥
          </p>
        </div>

        {/* CTA button */}
        <motion.span
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          className="relative mt-1 inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3.5 text-sm font-black uppercase tracking-wide text-amber-300 shadow-2xl sm:mt-0 sm:px-7 sm:text-base"
        >
          <TrendingUp className="h-5 w-5" />
          Order Now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </motion.span>
      </div>
    </motion.a>
  );
}
