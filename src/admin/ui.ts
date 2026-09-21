// Classes compartilhadas do painel (mesma paleta do site: night / acai / mango / cream).
export const card = "rounded-2xl border border-white/10 bg-night-900/80 p-5 sm:p-6";

const btnBase =
  "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400 disabled:cursor-wait disabled:opacity-50";

export const btn = `${btnBase} border border-white/20 text-cream-100 hover:border-white/45 hover:bg-white/5`;
export const btnPrimary = `${btnBase} bg-gradient-to-r from-acai-600 to-fuchsia-500 text-white hover:brightness-110`;
export const btnDanger = `${btnBase} border border-red-400/40 text-red-300 hover:border-red-400/70 hover:bg-red-400/10`;
export const btnOn = `${btnBase} border border-transparent bg-mango-400 text-night-1000 hover:bg-mango-300`;

export const input =
  "w-full rounded-xl border border-white/20 bg-white/[0.06] px-3.5 py-2.5 text-sm text-cream-50 outline-none placeholder:text-cream-100/50 focus:border-acai-400 focus:ring-2 focus:ring-acai-400/30";

export const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.18em] text-acai-300";

export const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
