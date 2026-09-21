"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

type Size = { label: string; price: number; soldOut?: boolean };

interface BuildProduct {
  id: string;
  name: string;
  image: string;
  sizes: string; // JSON string of Size[]
  freeToppingsLimit: number;
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const HOW_IT_WORKS = ["Escolha o tamanho", "Escolha os acompanhamentos", "Envie no WhatsApp"];

// Seção propositalmente simples: tamanho + um botão. Os acompanhamentos são escolhidos
// no montador (modal), que abre logo depois de tocar em "Monte seu açaí".
export default function MonteSeuAcai({
  product,
  paidToppings,
  onStart,
}: {
  product: BuildProduct | null;
  /** Só usado pra mostrar "adicionais a partir de R$ X". */
  paidToppings: Array<{ name: string; price: number }>;
  /** Mantido por compatibilidade com quem chama; a lista de grátis vive no montador. */
  freeToppings?: string[];
  onStart: (product: BuildProduct, size: Size) => void;
}) {
  const sizes: Size[] = product ? (JSON.parse(product.sizes) as Size[]) : [];
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  const selected = sizes.find((s) => s.label === pickedLabel) ?? sizes.find((s) => !s.soldOut) ?? sizes[0];
  const cheapestExtra = paidToppings.length > 0 ? Math.min(...paidToppings.map((t) => t.price)) : null;

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
              Do <span className="text-gradient italic">seu jeito</span>, em 3 passos
            </>
          }
          description="Escolha o tamanho, toque em Monte seu açaí e capriche nos acompanhamentos."
        />

        {!product || !selected ? (
          <p className="mt-16 text-center text-sm text-cream-100/60">Carregando...</p>
        ) : (
          <div className="mt-14 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            {/* visual */}
            <Reveal>
              <div className="ring-glow relative overflow-hidden rounded-[2rem]">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover object-[center_30%] sm:aspect-[16/9] lg:aspect-[4/5]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night-1000/90 via-night-1000/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acai-300">Base do seu pedido</p>
                  <p className="font-display mt-1 text-3xl font-semibold text-cream-50">{product.name}</p>
                </div>
              </div>
            </Reveal>

            {/* escolha */}
            <Reveal delay={0.1}>
              <div className="glass flex flex-col gap-8 rounded-[2rem] p-6 sm:p-10">
                {/* como funciona */}
                <ol className="grid grid-cols-3 gap-3" aria-label="Como funciona">
                  {HOW_IT_WORKS.map((label, index) => (
                    <li key={label} className="flex flex-col items-center gap-2 text-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-acai-500 to-fuchsia-500 text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="text-xs font-medium leading-snug text-cream-100/80 sm:text-sm">{label}</span>
                    </li>
                  ))}
                </ol>

                {/* tamanho */}
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-cream-50">Qual tamanho você quer?</p>
                  <div className="grid grid-cols-3 gap-3" role="group" aria-label="Tamanho do açaí">
                    {sizes.map((sz) => {
                      const active = sz.label === selected.label;
                      return (
                        <button
                          key={sz.label}
                          type="button"
                          onClick={() => setPickedLabel(sz.label)}
                          disabled={sz.soldOut}
                          aria-pressed={active}
                          className={`flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 active:scale-[0.97] ${
                            active
                              ? "border-transparent bg-gradient-to-br from-acai-500 to-fuchsia-500 text-white shadow-lg shadow-acai-500/30"
                              : "border-white/15 bg-white/[0.04] text-cream-50 hover:border-acai-400/50 hover:bg-white/[0.08]"
                          }`}
                        >
                          <span className="text-base font-bold uppercase tracking-wide">{sz.label}</span>
                          <span className={`text-base font-semibold ${active ? "text-white" : "text-mango-300"}`}>
                            {sz.soldOut ? "Esgotado" : brl(sz.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* botão principal */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => !selected.soldOut && onStart(product, selected)}
                    disabled={selected.soldOut}
                    className="btn-primary group inline-flex min-h-[60px] w-full cursor-pointer items-center justify-center gap-3 rounded-full px-8 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
                  >
                    {selected.soldOut ? "Esgotado no momento" : "Monte seu açaí"}
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </button>
                  <p className="text-center text-sm text-cream-100/70">
                    Até {product.freeToppingsLimit} acompanhamentos grátis
                    {cheapestExtra !== null ? ` · adicionais a partir de ${brl(cheapestExtra)}` : ""}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
