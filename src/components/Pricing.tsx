"use client";

import { motion } from "framer-motion";
import { Check, Crown, ShoppingBag } from "lucide-react";
import { Reveal, SectionHeading, StaggerGroup, StaggerItem } from "./Reveal";
import { combos } from "../data/content";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Pricing({ onOrder }: { onOrder: (comboName: string) => void }) {
  return (
    <section id="combos" className="relative overflow-hidden py-24 sm:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-[12%] h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-acai-600/12 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Combos"
          title={
            <>
              Quanto mais açaí, <span className="text-gradient italic">maior a festa</span>
            </>
          }
          description="Combos pensados para cada momento — do desejo solo ao encontro em família. Peça direto pelo WhatsApp."
        />

        <StaggerGroup className="mt-16 grid items-stretch gap-6 lg:grid-cols-3" amount={0.15}>
          {combos.map((combo, i) => {
            const inner = (
              <div
                className={`relative flex h-full flex-col gap-6 rounded-[calc(1.75rem-1px)] p-8 ${
                  combo.popular ? "bg-night-900/95" : "glass"
                }`}
              >
                {combo.popular && (
                  <span className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-mango-400 to-orange-500 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-night-1000 shadow-lg shadow-mango-500/40">
                    <Crown className="h-3.5 w-3.5" />
                    Mais popular
                  </span>
                )}

                <div>
                  <h3 className="font-display text-2xl font-semibold text-cream-50">{combo.name}</h3>
                  <p className="mt-1.5 text-sm text-cream-100/55">{combo.description}</p>
                </div>

                <div className="flex items-end gap-2.5">
                  <span className="font-display text-5xl font-semibold tracking-tight text-cream-50">
                    {brl(combo.price)}
                  </span>
                  <span className="flex flex-col pb-1.5">
                    <span className="text-sm text-cream-100/40 line-through">
                      {brl(combo.oldPrice)}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      economize {brl(combo.oldPrice - combo.price)}
                    </span>
                  </span>
                </div>

                <ul className="flex flex-col gap-3">
                  {combo.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-cream-100/70">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          combo.popular
                            ? "bg-gradient-to-br from-acai-500 to-fuchsia-500 text-white"
                            : "bg-white/8 text-acai-300"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => onOrder(combo.name)}
                  whileTap={{ scale: 0.96 }}
                  className={`mt-auto flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold text-white ${
                    combo.popular
                      ? "btn-primary shadow-lg shadow-acai-600/30"
                      : "border border-white/12 bg-white/[0.05] transition-all duration-300 hover:border-acai-400/40 hover:bg-white/[0.09]"
                  }`}
                  aria-label={`Pedir ${combo.name}`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {combo.cta}
                </motion.button>
              </div>
            );

            return (
              <StaggerItem key={combo.id} delay={i * 0.06} className="h-full">
                <Reveal delay={0} y={0} className="h-full">
                  <div
                    className={`relative h-full rounded-[1.75rem] ${
                      combo.popular
                        ? "bg-gradient-to-b from-acai-400 via-fuchsia-500 to-mango-400 p-[1.5px] shadow-[0_0_70px_-18px_rgba(168,85,247,0.55)]"
                        : ""
                    }`}
                  >
                    {combo.popular && (
                      <div
                        className="absolute -inset-1 -z-10 rounded-[2rem] bg-acai-500/25 blur-2xl"
                        aria-hidden="true"
                      />
                    )}
                    {inner}
                  </div>
                </Reveal>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <Reveal delay={0.15}>
          <p className="mt-10 text-center text-sm text-cream-100/45">
            Sem pedido mínimo e sem taxa de surpresa. Combos valem para toda a área de entrega.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
