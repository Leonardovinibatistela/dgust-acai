"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock, Wallet } from "lucide-react";
import { Reveal } from "./Reveal";

export default function CTA() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-24 sm:py-36">
      {/* background */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/images/acai-berries.jpg"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-night-1000/82" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_50%,transparent_0%,rgba(11,2,22,0.88)_100%)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay" />
      </div>

      {/* floating mini bowls */}
      <motion.img
        src="/images/hero-bowl.jpg"
        alt=""
        aria-hidden="true"
        animate={reduce ? {} : { y: [0, -16, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-10 top-14 hidden h-36 w-36 rounded-full object-cover opacity-25 ring-1 ring-white/15 lg:block"
      />
      <motion.img
        src="/images/bowl-tropical.jpg"
        alt=""
        aria-hidden="true"
        animate={reduce ? {} : { y: [0, 14, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="pointer-events-none absolute -right-8 bottom-14 hidden h-28 w-28 rounded-full object-cover opacity-25 ring-1 ring-white/15 lg:block"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 text-center sm:px-8">
        <Reveal>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-mango-300">
            <Clock className="h-3.5 w-3.5" />
            Entrega em até 30 minutos
          </span>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="font-display mt-7 text-5xl font-medium leading-[1.05] tracking-tight text-cream-50 sm:text-6xl lg:text-7xl">
            Bateu aquela <span className="text-gradient italic">vontade</span>?
          </h2>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-100/70 sm:text-lg">
            Não deixe para amanhã a sobremesa que você pode estar comendo em meia hora. Monte seu
            bowl agora e sinta o Dgust hoje mesmo.
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="#cardapio"
              className="btn-primary group inline-flex items-center gap-3 rounded-full px-9 py-5 text-lg font-bold text-white"
            >
              Pedir meu açaí agora
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.32}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-medium text-cream-100/55">
            <span className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-400" />
              Sem pedido mínimo
            </span>
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-mango-400" />
              Pague online ou na entrega
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-acai-300" />
              Todos os dias, 10h às 23h
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
