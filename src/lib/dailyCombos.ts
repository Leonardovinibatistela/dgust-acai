"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./firebase";
import { storeWeekday } from "./storeHours";

// Combo do dia: o dono cadastra combos e escolhe em quais dias da semana cada um vale.
// O site mostra, na seção "Combo do dia", só os combos que valem hoje. Cada combo é um
// documento em dailyCombos/. A foto (opcional) fica no próprio documento como JPEG
// reduzido no navegador, igual às fotos do cardápio.

export type DailyCombo = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  /** 0 = domingo ... 6 = sábado */
  days: number[];
};

export const WEEKDAYS: { value: number; short: string; label: string }[] = [
  { value: 1, short: "Seg", label: "Segunda-feira" },
  { value: 2, short: "Ter", label: "Terça-feira" },
  { value: 3, short: "Qua", label: "Quarta-feira" },
  { value: 4, short: "Qui", label: "Quinta-feira" },
  { value: 5, short: "Sex", label: "Sexta-feira" },
  { value: 6, short: "Sáb", label: "Sábado" },
  { value: 0, short: "Dom", label: "Domingo" },
];
const LABEL_BY_DAY = new Map(WEEKDAYS.map((d) => [d.value, d.label]));

/** "Terça-feira, Quarta-feira e Sábado" a partir de uma lista de dias. */
export function formatDaysLabel(days: number[]): string {
  const sorted = [...days].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
  const names = sorted.map((d) => LABEL_BY_DAY.get(d) ?? "").filter(Boolean);
  if (names.length === 0) return "Nenhum dia selecionado";
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

/** O combo vale hoje? (dia da semana no fuso de Cuiabá, igual em qualquer aparelho) */
export const isComboToday = (combo: DailyCombo, date: Date = new Date()) => combo.days.includes(storeWeekday(date));

const combosRef = () => collection(getDb(), "dailyCombos");

export function subscribeDailyCombos(onUpdate: (combos: DailyCombo[]) => void): () => void {
  if (!isFirebaseConfigured) return () => {};
  return onSnapshot(
    query(combosRef(), orderBy("createdAt", "asc")),
    (snapshot) =>
      onUpdate(
        snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: String(data.name ?? ""),
            description: String(data.description ?? ""),
            price: Number(data.price) || 0,
            image: typeof data.image === "string" ? data.image : "",
            days: Array.isArray(data.days) ? (data.days as number[]) : [],
          };
        })
      ),
    (error) => console.warn("dailyCombos:", error)
  );
}

export type ComboInput = { name: string; description: string; price: number; image: string; days: number[] };

export const addDailyCombo = (input: ComboInput) => addDoc(combosRef(), { ...input, createdAt: serverTimestamp() });
export const updateDailyCombo = (id: string, patch: Partial<ComboInput>) => updateDoc(doc(getDb(), "dailyCombos", id), { ...patch });
export const removeDailyCombo = (id: string) => deleteDoc(doc(getDb(), "dailyCombos", id));

/** null = ainda carregando (ou painel não configurado) */
export function useDailyCombos(): DailyCombo[] | null {
  const [combos, setCombos] = useState<DailyCombo[] | null>(null);
  useEffect(() => subscribeDailyCombos(setCombos), []);
  return combos;
}
