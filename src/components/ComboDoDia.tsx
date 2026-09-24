"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { formatDaysLabel, type DailyCombo } from "../lib/dailyCombos";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ROTATE_MS = 6000;

/**
 * "Combo do dia": mostra só os combos que valem hoje (o dono escolhe os dias no painel).
 * Com mais de um combo no mesmo dia, alterna sozinho e também tem setas e bolinhas.
 * Não renderiza nada se não houver combo hoje.
 */
export default function ComboDoDia({ combos, onAdd }: { combos: DailyCombo[]; onAdd: (combo: DailyCombo) => void }) {
  const [index, setIndex] = useState(0);
  const count = combos.length;

  useEffect(() => {
    if (count <= 1) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [count]);

  if (count === 0) return null;

  const combo = combos[index % count];
  const goTo = (next: number) => setIndex((next + count) % count);

  return (
    <section id="combo-do-dia" className="relative py-16 sm:py-24" aria-labelledby="combo-do-dia-title">
      <div className="pointer-events-none absolute left-[-10%] top-[10%] h-[420px] w-[420px] rounded-full bg-mango-500/10 blur-[130px]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mango-300">Vale hoje</p>
        <h2 id="combo-do-dia-title" className="font-display mt-2 text-4xl font-medium tracking-tight text-cream-50 sm:text-5xl">
          Combo do <span className="text-gradient italic">dia</span>
        </h2>

        <div className="glass relative mt-8 overflow-hidden rounded-[2rem] border-mango-400/25 p-6 sm:p-10">
          <div key={combo.id} className="reveal-in-fade grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex items-center rounded-full bg-mango-400 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-night-1000">Vale hoje</span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-mango-300/90">{formatDaysLabel(combo.days)}</p>
              <h3 className="font-display mt-3 text-3xl font-semibold tracking-tight text-cream-50 sm:text-4xl">{combo.name}</h3>
              {combo.description && <p className="mt-3 max-w-lg text-base leading-relaxed text-cream-100/75">{combo.description}</p>}
              <div className="mt-6 flex flex-wrap items-center gap-5">
                <span className="font-display text-4xl font-semibold text-cream-50">{brl(combo.price)}</span>
                <button
                  type="button"
                  onClick={() => onAdd(combo)}
                  className="btn-primary group inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-full px-7 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
                >
                  <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
                  Adicionar ao pedido
                </button>
              </div>
            </div>

            {combo.image && <img src={combo.image} alt={combo.name} loading="lazy" className="aspect-square w-full rounded-2xl object-cover object-[center_30%] sm:w-72 lg:w-80" />}
          </div>

          {count > 1 && (
            <>
              <div className="mt-8 flex items-center justify-center gap-3">
                <button type="button" onClick={() => goTo(index - 1)} aria-label="Combo anterior" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-white/20 text-cream-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400">
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="flex items-center gap-1" role="group" aria-label="Escolher combo">
                  {combos.map((item, i) => (
                    <button key={item.id} type="button" onClick={() => goTo(i)} aria-label={`Ver ${item.name}`} aria-current={i === index % count} className="grid h-8 w-8 cursor-pointer place-items-center focus-visible:outline-none">
                      <span className={`h-2.5 rounded-full transition-all ${i === index % count ? "w-7 bg-mango-400" : "w-2.5 bg-white/30"}`} />
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => goTo(index + 1)} aria-label="Próximo combo" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-white/20 text-cream-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400">
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
