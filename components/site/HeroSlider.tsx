"use client";

// ============================================================
// HeroSlider — unlimited slides, auto-rotate (4s), touch swipe,
// fade transition, optional CTA button, dots + arrows.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { Slide } from "@/types";

const AUTOPLAY_MS = 4000;

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const count = slides.length;
  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setDir(next > index ? 1 : -1);
      setIndex(((next % count) + count) % count);
    },
    [count, index]
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Autoplay
  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, count]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (count === 0) return null;

  const variants = {
    enter: (d: number) => ({ opacity: 0, scale: 1.04, x: d * 40 }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, scale: 1.02, x: d * -40 }),
  };

  return (
    <div
      className="relative aspect-[16/11] w-full overflow-hidden rounded-3xl border border-white/8 shadow-glass sm:aspect-[16/7]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx > 45) prev();
        else if (dx < -45) next();
        touchX.current = null;
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
    >
      <AnimatePresence custom={dir} initial={false} mode="popLayout">
        <motion.div
          key={slides[index].id}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slides[index].imageUrl}
            alt={slides[index].title || "Slide"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <div className="max-w-2xl">
              {slides[index].title && (
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-display text-2xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl"
                >
                  {slides[index].title}
                </motion.h2>
              )}
              {slides[index].subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-2 max-w-lg text-sm text-neutral-200 sm:text-base"
                >
                  {slides[index].subtitle}
                </motion.p>
              )}
              {slides[index].buttonText && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-4"
                >
                  {slides[index].buttonLink &&
                  /^https?:\/\//.test(slides[index].buttonLink) ? (
                    <a
                      href={slides[index].buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold text-sm sm:text-base"
                    >
                      {slides[index].buttonText}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href={slides[index].buttonLink || "/"}
                      className="btn-gold text-sm sm:text-base"
                    >
                      {slides[index].buttonText}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows (desktop) */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="glass absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full p-2 text-white/80 hover:text-gold-300 sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="glass absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full p-2 text-white/80 hover:text-gold-300 sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-6 bg-gold-500"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
