"use client";

import { Sparkle } from "lucide-react";
import { marqueeItems } from "../data/content";

export default function Marquee() {
  const row = [...marqueeItems, ...marqueeItems];
  return (
    <section aria-hidden="true" className="relative z-10 -mt-1 overflow-hidden border-y border-white/5 bg-night-950/80 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-night-1000 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-night-1000 to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-8 pr-8 hover:[animation-play-state:paused]">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-cream-100/45">
              {item}
            </span>
            <Sparkle className="h-3.5 w-3.5 fill-acai-500/60 text-acai-500/60" />
          </span>
        ))}
      </div>
    </section>
  );
}
