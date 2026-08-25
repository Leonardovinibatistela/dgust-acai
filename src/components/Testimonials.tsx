"use client";

import { Quote, Star } from "lucide-react";
import { Reveal, SectionHeading, StaggerGroup, StaggerItem } from "./Reveal";
import { testimonials } from "../data/content";

export default function Testimonials() {
  return (
    <section id="avaliacoes" className="relative py-24 sm:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(72rem,90%)] -translate-x-1/2 bg-gradient-to-r from-transparent via-acai-500/30 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[-10%] bottom-[10%] h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Avaliações"
          title={
            <>
              Quem prova, <span className="text-gradient italic">se apaixona</span>
            </>
          }
          description="Histórias reais de quem transformou o Dgust na sobremesa oficial de casa."
        />

        {/* rating banner */}
        <Reveal delay={0.1} className="mt-12">
          <div className="glass mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-[2rem] px-8 py-7 sm:flex-row sm:justify-center sm:gap-10">
            <div className="flex items-center gap-4">
              <span className="font-display text-6xl font-semibold text-gradient">4.9</span>
              <span className="flex flex-col gap-1">
                <span className="flex text-mango-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-current" />
                  ))}
                </span>
                <span className="text-xs font-medium text-cream-100/55">
                  baseado em 12.400+ avaliações
                </span>
              </span>
            </div>
            <span className="hidden h-10 w-px bg-white/10 sm:block" aria-hidden="true" />
            <p className="max-w-[220px] text-center text-sm leading-snug text-cream-100/60 sm:text-left">
              Nota máxima nas plataformas de entrega da cidade
            </p>
          </div>
        </Reveal>

        <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" amount={0.1}>
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="card-hover glass relative flex h-full flex-col gap-5 rounded-3xl p-7">
                <Quote
                  className="absolute right-6 top-6 h-8 w-8 text-acai-500/15"
                  aria-hidden="true"
                />
                <span className="flex gap-0.5 text-mango-400" aria-label={`${t.rating} de 5 estrelas`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </span>
                <blockquote className="text-[15px] leading-relaxed text-cream-100/75">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3.5 border-t border-white/8 pt-5">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.hue} text-sm font-bold text-white shadow-lg`}
                  >
                    {t.initials}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-bold text-cream-50">{t.name}</span>
                    <span className="text-xs text-cream-100/50">{t.neighborhood}</span>
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
