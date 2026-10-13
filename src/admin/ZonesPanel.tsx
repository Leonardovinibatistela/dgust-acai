"use client";

import { useState } from "react";
import { MapPinned, Pencil, Trash2 } from "lucide-react";
import { addDeliveryZone, removeDeliveryZone, updateDeliveryZone, useDeliveryZones, type DeliveryZone } from "../lib/deliveryZones";
import type { ConfirmFn } from "./useConfirm";
import { brl, btn, btnDanger, btnPrimary, card, eyebrow, input } from "./ui";

const errorText = (error: unknown) => {
  const e = error as { code?: string; message?: string } | undefined;
  return `${e?.code ? `[${e.code}] ` : ""}${e?.message ?? String(error)}`;
};

const parseFee = (text: string) => {
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) && value >= 0 && value <= 999 ? value : null;
};

function ZoneRow({ zone, onError, confirm }: { zone: DeliveryZone; onError: (message: string) => void; confirm: ConfirmFn }) {
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(zone.name);
  const [feeDraft, setFeeDraft] = useState(zone.fee.toFixed(2).replace(".", ","));
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const name = nameDraft.trim();
    const fee = parseFee(feeDraft);
    if (!name) return onError("Digite o nome do bairro.");
    if (fee === null) return onError("Digite uma taxa válida (pode ser 0 para grátis).");
    setBusy(true);
    try {
      await updateDeliveryZone(zone.id, { name, fee });
      setEditing(false);
    } catch (error) {
      onError(`Não foi possível salvar o bairro.\n\nDetalhe do erro: ${errorText(error)}`);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!(await confirm(`Remover "${zone.name}" da lista de bairros? Essa ação não pode ser desfeita.`, { confirmLabel: "Remover bairro", danger: true }))) return;
    setBusy(true);
    try {
      await removeDeliveryZone(zone.id);
    } catch (error) {
      onError(`Não foi possível remover esse bairro.\n\nDetalhe do erro: ${errorText(error)}`);
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <li className="flex flex-wrap items-center gap-2 px-4 py-3">
        <label className="sr-only" htmlFor={`zone-name-${zone.id}`}>
          Nome do bairro
        </label>
        <input id={`zone-name-${zone.id}`} type="text" autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} className={`${input} !w-auto flex-1`} />
        <span className="text-sm text-cream-100/75">R$</span>
        <label className="sr-only" htmlFor={`zone-fee-${zone.id}`}>
          Taxa de entrega
        </label>
        <input id={`zone-fee-${zone.id}`} type="text" inputMode="decimal" value={feeDraft} onChange={(e) => setFeeDraft(e.target.value)} className={`${input} !w-20`} />
        <button type="button" onClick={save} disabled={busy} className={btnPrimary}>
          {busy ? "…" : "Salvar"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className={btn}>
          Cancelar
        </button>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-cream-50">{zone.name}</span>
        <span className="text-sm text-mango-300">{brl(zone.fee)}</span>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditing(true)} disabled={busy} className={btn}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Editar
        </button>
        <button type="button" onClick={remove} disabled={busy} className={btnDanger}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Remover
        </button>
      </div>
    </li>
  );
}

function NewZoneForm({ onError }: { onError: (message: string) => void }) {
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    const value = parseFee(fee);
    if (!trimmed) return onError("Digite o nome do bairro.");
    if (value === null) return onError("Digite uma taxa válida (pode ser 0 para grátis).");
    setBusy(true);
    try {
      await addDeliveryZone({ name: trimmed, fee: value });
      setName("");
      setFee("");
    } catch (error) {
      onError(`Não foi possível adicionar o bairro.\n\nDetalhe do erro: ${errorText(error)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 px-4 py-4" aria-label="Novo bairro">
      <div className="min-w-[10rem] flex-1">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-100/60" htmlFor="new-zone-name">
          Bairro
        </label>
        <input id="new-zone-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Centro" className={`${input} mt-1.5`} />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-cream-100/60" htmlFor="new-zone-fee">
          Taxa (R$)
        </label>
        <input id="new-zone-fee" type="text" inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="Ex.: 7,00" className={`${input} mt-1.5 !w-24`} />
      </div>
      <button type="submit" disabled={busy} className={btnPrimary}>
        {busy ? "Adicionando…" : "Adicionar bairro"}
      </button>
    </form>
  );
}

export default function ZonesPanel({ onError, confirm }: { onError: (message: string) => void; confirm: ConfirmFn }) {
  const zones = useDeliveryZones();

  return (
    <div className="mt-8 space-y-6">
      <div className={card}>
        <p className={eyebrow}>Entrega</p>
        <h2 className="font-display mt-1 text-2xl font-semibold text-cream-50">Taxa por bairro</h2>
        <p className="mt-2 text-sm leading-relaxed text-cream-100/75">
          Cadastre os bairros que vocês atendem e a taxa de cada um. No checkout, o cliente escolhe o bairro numa lista e o site já cobra o valor certo — sem precisar calcular distância.
          {" "}Enquanto a lista estiver vazia, o site usa uma taxa única para qualquer endereço.
        </p>
      </div>

      <div className={card}>
        {zones === null ? (
          <p className="text-center text-sm text-cream-100/75">Carregando…</p>
        ) : zones.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-white/20 p-4">
            <MapPinned className="mt-0.5 h-5 w-5 shrink-0 text-cream-100/60" aria-hidden="true" />
            <div>
              <p className="font-semibold text-cream-50">Nenhum bairro cadastrado ainda.</p>
              <p className="mt-1 text-sm text-cream-100/70">Cadastre o primeiro no formulário abaixo.</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {zones.map((zone) => (
              <ZoneRow key={zone.id} zone={zone} onError={onError} confirm={confirm} />
            ))}
          </ul>
        )}
      </div>

      <div className={`${card} !p-0`}>
        <NewZoneForm onError={onError} />
      </div>
    </div>
  );
}
