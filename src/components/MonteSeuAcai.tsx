"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Check, Plus } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

type Size = { label: string; price: number };

interface BuildProduct {
  id: string;
  name: string;
  image: string;
  sizes: string; // JSON string of Size[]
  freeToppingsLimit: number;
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function StepTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-acai-500 to-fuchsia-500 text-sm font-bold text-white">
        {n}
      </span>
      <h3 className="text-base font-semibold text-cream-50 sm:text-lg">{children}</h3>
    </div>
  );
}

export default function MonteSeuAcai({
  product,
  freeToppings,
  paidToppings,
  onStart,
}: {
  product: BuildProduct | null;
  freeToppings: string[];
  paidToppings: Array<{ name: string; price: number }>;
  onStart: (product: BuildProduct, size: Size) => void;
}) {
  const sizes: Size[] = product ? (JSON.parse(product.sizes) as Size[]) : [];
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  const selected = sizes.find((s) => s.label === pickedLabel) ?? sizes[0];

  return (
    <section id="monte-seu-acai" className="relative py-24 sm:py-32">
      <div
        className="pointer-events-none absolute right-[-10%] top-[10%] h-[460px] w-[460px] rounded-full bg-fuchsia-600/12 blur-[130px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Monte seu Açaí"
          title={
            <>
              Do <span className="text-gradient italic">seu jeito</span>, do começo ao fim
            </>
          }
          description="Escolha o tamanho, capriche nos acompanhamentos grátis e turbine com os adicionais que quiser."
        />

        {!product || !selected ? (
          <p className="mt-16 text-center text-sm text-cream-100/60">Carregando...</p>
        ) : (
          <div className="mt-14 grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
            {/* visual */}
            <Reveal className="lg:sticky lg:top-28">
              <div className="ring-glow relative overflow-hidden rounded-[2rem]">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover object-[center_30%] sm:aspect-[16/9] lg:aspect-[4/5]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night-1000/90 via-night-1000/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acai-300">
                    Base do seu pedido
                  </p>
                  <p className="font-display mt-1 text-3xl font-semibold text-cream-50">
                    {product.name}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* steps */}
            <Reveal delay={0.1}>
              <div className="glass flex flex-col gap-9 rounded-[2rem] p-6 sm:p-9">
                {/* 1. size */}
                <div className="flex flex-col gap-4">
                  <StepTitle n={1}>Escolha o tamanho</StepTitle>
                  <div className="grid grid-cols-3 gap-3" role="group" aria-label="Tamanho do açaí">
                    {sizes.map((sz) => {
                      const active = sz.label === selected.label;
                      return (
                        <button
                          key={sz.label}
                          type="button"
                          onClick={() => setPickedLabel(sz.label)}
                          aria-pressed={active}
                          className={`flex min-h-[72px] flex-col items-center justify-center gap-0.5 rounded-2xl border px-2 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 active:scale-[0.97] ${
                            active
                              ? "border-transparent bg-gradient-to-br from-acai-500 to-fuchsia-500 text-white shadow-lg shadow-acai-500/30"
                              : "border-white/15 bg-white/[0.04] text-cream-50 hover:border-acai-400/50 hover:bg-white/[0.08]"
                          }`}
                        >
                          <span className="text-sm font-bold uppercase tracking-wide">{sz.label}</span>
                          <span className={`text-sm font-semibold ${active ? "text-white" : "text-mango-300"}`}>
                            {brl(sz.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. free toppings */}
                <div className="flex flex-col gap-4">
                  <StepTitle n={2}>
                    Até {product.freeToppingsLimit} acompanhamentos grátis
                  </StepTitle>
                  <ul className="flex flex-wrap gap-2">
                    {freeToppings.map((t) => (
                      <li
                        key={t}
                        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-cream-100/85"
                      >
                        <Check className="h-3 w-3 text-acai-300" aria-hidden="true" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. paid toppings */}
                <div className="flex flex-col gap-4">
                  <StepTitle n={3}>Turbine com adicionais</StepTitle>
                  <ul className="flex flex-wrap gap-2">
                    {paidToppings.map((t) => (
                      <li
                        key={t.name}
                        className="flex items-center gap-1.5 rounded-full border border-mango-400/25 bg-mango-400/[0.07] px-3 py-1.5 text-xs font-medium text-cream-100/90"
                      >
                        <Plus className="h-3 w-3 text-mango-300" aria-hidden="true" />
                        {t.name}
                        <span className="font-semibold text-mango-300">{brl(t.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* cta */}
                <div className="flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-cream-100/50">
                      {selected.label} · sem adicionais
                    </span>
                    <span className="font-display text-3xl font-semibold text-cream-50">
                      {brl(selected.price)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStart(product, selected)}
                    className="btn-primary group inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full px-8 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
                  >
                    Montar meu açaí
                    <ArrowRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1.5" />
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
