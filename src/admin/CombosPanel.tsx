"use client";

import { useState } from "react";
import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import { addDailyCombo, formatDaysLabel, isComboToday, removeDailyCombo, updateDailyCombo, useDailyCombos, WEEKDAYS, type DailyCombo } from "../lib/dailyCombos";
import { fileToJpegDataUrl } from "./resizeImage";
import type { ConfirmFn } from "./useConfirm";
import { brl, btn, btnDanger, btnPrimary, card, eyebrow, input } from "./ui";

const errorText = (error: unknown) => {
  const e = error as { code?: string; message?: string } | undefined;
  return `${e?.code ? `[${e.code}] ` : ""}${e?.message ?? String(error)}`;
};

const parsePrice = (text: string) => {
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) && value > 0 && value <= 999 ? value : null;
};

function DayToggles({ days, onToggle, disabled, label }: { days: number[]; onToggle: (day: number) => void; disabled?: boolean; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {WEEKDAYS.map((day) => {
        const active = days.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            onClick={() => onToggle(day.value)}
            disabled={disabled}
            aria-pressed={active}
            aria-label={day.label}
            className={`inline-flex min-h-9 min-w-12 items-center justify-center rounded-full border px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400 disabled:cursor-wait disabled:opacity-50 ${
              active ? "border-transparent bg-gradient-to-r from-acai-600 to-fuchsia-500 text-white" : "border-white/20 text-cream-100 hover:border-white/45 hover:bg-white/5"
            }`}
          >
            {day.short}
          </button>
        );
      })}
    </div>
  );
}

function ComboCard({ combo, onError, confirm }: { combo: DailyCombo; onError: (message: string) => void; confirm: ConfirmFn }) {
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [priceDraft, setPriceDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (task: () => Promise<unknown>, failure: string) => {
    setBusy(true);
    try {
      await task();
      return true;
    } catch (error) {
      onError(`${failure}\n\nDetalhe do erro: ${errorText(error)}`);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const startEdit = () => {
    setNameDraft(combo.name);
    setPriceDraft(combo.price.toFixed(2).replace(".", ","));
    setDescriptionDraft(combo.description);
    setEditing(true);
  };

  const save = async () => {
    const name = nameDraft.trim();
    const price = parsePrice(priceDraft);
    if (!name) return onError("Digite o nome do combo.");
    if (price === null) return onError("Digite um preço válido (ex.: 29,90).");
    const saved = await run(() => updateDailyCombo(combo.id, { name, price, description: descriptionDraft.trim() }), "Não foi possível salvar o combo.");
    if (saved) setEditing(false);
  };

  const toggleDay = (day: number) => {
    const next = combo.days.includes(day) ? combo.days.filter((d) => d !== day) : [...combo.days, day].sort((a, b) => a - b);
    if (next.length === 0) return onError("O combo precisa valer em pelo menos um dia da semana. Para tirar ele do site, use \"Remover combo\".");
    void run(() => updateDailyCombo(combo.id, { days: next }), "Não foi possível atualizar os dias desse combo.");
  };

  const changePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void run(async () => updateDailyCombo(combo.id, { image: await fileToJpegDataUrl(file) }), "Não foi possível trocar a foto.");
  };

  const remove = async () => {
    if (!(await confirm(`Remover "${combo.name}" do Combo do dia? Essa ação não pode ser desfeita.`, { confirmLabel: "Remover combo", danger: true }))) return;
    void run(() => removeDailyCombo(combo.id), "Não foi possível remover esse combo.");
  };

  const validToday = isComboToday(combo);

  return (
    <article className="rounded-2xl border border-white/10 bg-night-900/80 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <label className={`group relative grid h-20 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border border-white/20 bg-white/[0.04] text-[10px] font-semibold text-cream-100/70 focus-within:ring-2 focus-within:ring-mango-400 ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {combo.image ? <img src={combo.image} alt="" className="h-full w-full object-cover object-[center_30%]" /> : <span>Sem foto</span>}
          <span className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center text-[10px] font-semibold text-white">Trocar foto</span>
          <input type="file" accept="image/*" onChange={changePhoto} disabled={busy} className="sr-only" aria-label={`Trocar a foto de ${combo.name}`} />
        </label>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <label className="sr-only" htmlFor={`combo-name-${combo.id}`}>
                Nome do combo
              </label>
              <input id={`combo-name-${combo.id}`} type="text" autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="Nome do combo" className={input} />
              <label className="sr-only" htmlFor={`combo-desc-${combo.id}`}>
                Descrição
              </label>
              <textarea id={`combo-desc-${combo.id}`} value={descriptionDraft} onChange={(e) => setDescriptionDraft(e.target.value)} placeholder="Descrição (o que vem no combo)" rows={2} className={`${input} resize-none`} />
              <div className="flex items-center gap-2">
                <span className="text-sm text-cream-100/75">R$</span>
                <label className="sr-only" htmlFor={`combo-price-${combo.id}`}>
                  Preço
                </label>
                <input id={`combo-price-${combo.id}`} type="text" inputMode="decimal" value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} className={`${input} !w-28`} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={save} disabled={busy} className={btnPrimary}>
                  {busy ? "Salvando…" : "Salvar"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className={btn}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-cream-50">{combo.name}</h3>
                <span className="text-sm font-semibold text-mango-300">{brl(combo.price)}</span>
                {validToday && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">Vale hoje</span>}
              </div>
              {combo.description && <p className="mt-1 text-sm leading-relaxed text-cream-100/75">{combo.description}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={startEdit} className={btn}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Editar nome, preço e descrição
                </button>
                <button type="button" onClick={remove} disabled={busy} className={btnDanger}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remover combo
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-100/60">Dias em que aparece no site</p>
        <div className="mt-2">
          <DayToggles days={combo.days} onToggle={toggleDay} disabled={busy} label={`Dias da semana de ${combo.name}`} />
        </div>
        <p className="mt-2 text-xs text-cream-100/65">{formatDaysLabel(combo.days)}</p>
      </div>
    </article>
  );
}

function NewComboForm({ onError }: { onError: (message: string) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [days, setDays] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  const pickPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setImage(await fileToJpegDataUrl(file));
    } catch (error) {
      onError(`Não foi possível usar essa foto.\n\nDetalhe: ${errorText(error)}`);
    }
  };

  const toggleDay = (day: number) => setDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort((a, b) => a - b)));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    const value = parsePrice(price);
    if (!trimmed) return onError("Digite o nome do combo.");
    if (value === null) return onError("Digite um preço válido (ex.: 29,90).");
    if (days.length === 0) return onError("Escolha pelo menos um dia da semana para o combo aparecer.");
    setBusy(true);
    try {
      await addDailyCombo({ name: trimmed, description: description.trim(), price: value, image, days });
      setName("");
      setPrice("");
      setDescription("");
      setImage("");
      setDays([]);
    } catch (error) {
      onError(`Não foi possível adicionar o combo.\n\nDetalhe do erro: ${errorText(error)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={card} aria-label="Novo combo">
      <p className={eyebrow}>Novo combo</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr]">
        <label className={`flex h-28 w-28 cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-dashed border-white/25 text-[11px] font-semibold text-cream-100/75 transition hover:border-acai-400/60 hover:text-cream-50 focus-within:ring-2 focus-within:ring-mango-400 ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {image ? (
            <img src={image} alt="Prévia da foto do combo" className="h-full w-full object-cover object-[center_30%]" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
              Foto (opcional)
            </>
          )}
          <input type="file" accept="image/*" onChange={pickPhoto} disabled={busy} className="sr-only" aria-label="Foto do combo" />
        </label>

        <div className="grid min-w-0 gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-100/60" htmlFor="new-combo-name">
                Nome do combo
              </label>
              <input id="new-combo-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Combo Terça" className={`${input} mt-1.5`} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-100/60" htmlFor="new-combo-price">
                Preço (R$)
              </label>
              <input id="new-combo-price" type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex.: 29,90" className={`${input} mt-1.5`} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-100/60" htmlFor="new-combo-desc">
              Descrição (opcional)
            </label>
            <input id="new-combo-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Açaí 500ml com 3 acompanhamentos + 1 bombom" className={`${input} mt-1.5`} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-100/60">Dias da semana</p>
            <div className="mt-1.5">
              <DayToggles days={days} onToggle={toggleDay} disabled={busy} label="Dias da semana do novo combo" />
            </div>
          </div>
          <button type="submit" disabled={busy} className={`${btnPrimary} justify-self-start`}>
            {busy ? "Adicionando…" : "Adicionar combo"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function CombosPanel({ onError, confirm }: { onError: (message: string) => void; confirm: ConfirmFn }) {
  const combos = useDailyCombos();

  return (
    <div className="mt-8 space-y-6">
      <div className={card}>
        <p className={eyebrow}>Cardápio</p>
        <h2 className="font-display mt-1 text-2xl font-semibold text-cream-50">Combo do dia</h2>
        <p className="mt-2 text-sm leading-relaxed text-cream-100/75">
          É a seção &quot;Combo do dia&quot; do site. Escolha em quais dias da semana cada combo aparece, o preço e a foto. Se dois combos caírem no mesmo dia, o site alterna sozinho entre eles.
        </p>
      </div>

      {combos === null ? (
        <p className="text-center text-sm text-cream-100/75">Carregando…</p>
      ) : combos.length === 0 ? (
        <div className={`${card} text-center`}>
          <p className="font-semibold text-cream-50">Nenhum combo cadastrado ainda.</p>
          <p className="mt-1 text-sm text-cream-100/70">Crie o primeiro no formulário abaixo. Ele aparece no site nos dias que você escolher.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {combos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} onError={onError} confirm={confirm} />
          ))}
        </div>
      )}

      <NewComboForm onError={onError} />
    </div>
  );
}
