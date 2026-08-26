"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Snowflake, Timer, UtensilsCrossed } from "lucide-react";

function Orbs() {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        animate={reduce ? {} : { x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 top-[-10%] h-[560px] w-[560px] rounded-full bg-acai-600/25 blur-[130px]"
      />
      <motion.div
        animate={reduce ? {} : { x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-15%] top-[20%] h-[620px] w-[620px] rounded-full bg-fuchsia-600/20 blur-[140px]"
      />
      <motion.div
        animate={reduce ? {} : { x: [0, 30, 0], y: [0, 24, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-25%] left-[30%] h-[480px] w-[480px] rounded-full bg-indigo-600/20 blur-[120px]"
      />
    </div>
  );
}

function RotatingRing() {
  return (
    <div className="pointer-events-none absolute -inset-7 animate-spin-slower sm:-inset-10" aria-hidden="true">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <defs>
          <path id="dgust-circle" d="M 100,100 m -84,0 a 84,84 0 1,1 168,0 a 84,84 0 1,1 -168,0" />
        </defs>
        <text className="fill-cream-100/50 text-[8.2px] font-semibold uppercase" style={{ letterSpacing: "2.6px" }}>
          <textPath href="#dgust-circle">
            açaí 100% natural • entrega em 30 min • feito na hora •
          </textPath>
        </text>
      </svg>
    </div>
  );
}

function FloatChip({
  className,
  delay = 0,
  children,
  label,
}: {
  className: string;
  delay?: number;
  children: ReactNode;
  label: string;
}) {
  return (
    <div className={`reveal-in absolute z-20 ${className}`} style={{ animationDelay: `${delay}s` }}>
      <div className="glass-strong flex animate-float items-center gap-2.5 rounded-2xl px-4 py-3 shadow-xl shadow-black/30" style={{ animationDelay: `${delay}s` }}>
        {children}
        <span className="text-xs font-semibold text-cream-100">{label}</span>
      </div>
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const yVisual = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 90]);
  const yText = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -60]);
  const fade = useTransform(scrollY, [0, 480], [1, 0.15]);

  return (
    <section id="inicio" className="relative flex min-h-screen items-center overflow-hidden pt-[72px]">
      {/* background */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,#2a1245_0%,#1a0b2e_42%,#0b0216_100%)]" />
      <Orbs />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay" aria-hidden="true" />

      <motion.div style={{ opacity: fade }} className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-10 sm:px-8 lg:pb-16 lg:pt-16">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* copy */}
          <motion.div style={{ y: yText }} className="flex flex-col items-start gap-7 text-left">
            <span
              className="reveal-in glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-acai-200"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mango-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mango-400" />
              </span>
              Açaí artesanal · entrega em até 30 min
            </span>

            <h1
              className="reveal-in font-display max-w-2xl text-[2.65rem] font-medium leading-[1.04] tracking-tight text-cream-50 sm:text-6xl lg:text-[4.4rem]"
              style={{ animationDelay: "0.2s" }}
            >
              O açaí mais{" "}
              <em className="text-gradient not-italic sm:italic">cremoso</em> da cidade, direto na
              sua porta.
            </h1>

            <p
              className="reveal-in max-w-lg text-base leading-relaxed text-cream-100/65 sm:text-lg"
              style={{ animationDelay: "0.3s" }}
            >
              Frutas selecionadas, receita artesanal e aquele congelamento perfeito que só a Dgust
              tem. Monte seu açaí do seu jeito e receba geladinho onde você estiver.
            </p>

            <div
              className="reveal-in flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "0.4s" }}
            >
              <a
                href="#cardapio"
                className="btn-primary group inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-4 text-base font-semibold text-white"
              >
                Montar meu açaí
                <ArrowRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1.5" />
              </a>
              <a
                href="#cardapio-completo"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full glass px-7 py-4 text-base font-semibold text-cream-100 transition-all duration-300 hover:border-acai-400/40 hover:bg-white/10"
              >
                <UtensilsCrossed className="h-[18px] w-[18px] text-acai-300 transition-transform duration-300 group-hover:rotate-12" />
                Ver cardápio completo
              </a>
            </div>
          </motion.div>

          {/* visual */}
          <motion.div
            style={{ y: yVisual }}
            className="reveal-in-fade relative mx-auto w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[540px]"
          >
            <div className="relative aspect-square">
              {/* halo */}
              <div className="absolute -inset-10 animate-glow-pulse rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.4),rgba(217,70,239,0.14)_45%,transparent_70%)] blur-2xl" aria-hidden="true" />
              <RotatingRing />

              <div className="ring-glow relative h-full w-full overflow-hidden rounded-full">
                <img
                  src="/images/hero-bowl.jpg"
                  alt="Açaí Dgust com banana, morangos, granola e chocolate"
                  className="h-full w-full scale-[1.06] object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_28%,transparent_45%,rgba(11,2,22,0.55)_100%)]" />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/15" />
              </div>

              {/* floating chips */}
              <FloatChip className="hidden sm:block sm:-left-10 top-[16%]" delay={1.0} label="25 min em média">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-acai-500 to-fuchsia-500 text-white">
                  <Timer className="h-4 w-4" />
                </span>
              </FloatChip>
              <FloatChip className="hidden sm:block sm:-right-8 top-[42%]" delay={1.2} label="Sempre geladinho">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white">
                  <Snowflake className="h-4 w-4" />
                </span>
              </FloatChip>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* scroll cue */}
      <a
        href="#porque"
        className="reveal-in-fade absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2.5 text-cream-100/40 transition-colors hover:text-acai-300 md:flex"
        style={{ animationDelay: "1s" }}
        aria-label="Rolar para a próxima seção"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">descubra</span>
        <span className="flex h-9 w-[22px] items-start justify-center rounded-full border border-current p-1.5">
          <motion.span
            animate={reduce ? {} : { y: [0, 9, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-current"
          />
        </span>
      </a>
    </section>
  );
}
