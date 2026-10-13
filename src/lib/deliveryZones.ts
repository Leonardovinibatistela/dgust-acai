"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./firebase";

// Taxa de entrega por bairro: o dono cadastra cada bairro com sua taxa, e no checkout o
// cliente escolhe o bairro numa lista — o site já sabe quanto cobrar, sem precisar calcular
// distância. Cada bairro é um documento em deliveryZones/.

export type DeliveryZone = { id: string; name: string; fee: number };

const zonesRef = () => collection(getDb(), "deliveryZones");

export function subscribeDeliveryZones(onUpdate: (zones: DeliveryZone[]) => void): () => void {
  if (!isFirebaseConfigured) return () => {};
  return onSnapshot(
    query(zonesRef(), orderBy("name", "asc")),
    (snapshot) => onUpdate(snapshot.docs.map((d) => ({ id: d.id, name: String(d.data().name ?? ""), fee: Number(d.data().fee) || 0 }))),
    (error) => console.warn("deliveryZones:", error)
  );
}

export type ZoneInput = { name: string; fee: number };

export const addDeliveryZone = (input: ZoneInput) => addDoc(zonesRef(), input);
export const updateDeliveryZone = (id: string, patch: Partial<ZoneInput>) => updateDoc(doc(getDb(), "deliveryZones", id), { ...patch });
export const removeDeliveryZone = (id: string) => deleteDoc(doc(getDb(), "deliveryZones", id));

/** null = ainda carregando (ou painel não configurado) */
export function useDeliveryZones(): DeliveryZone[] | null {
  const [zones, setZones] = useState<DeliveryZone[] | null>(null);
  useEffect(() => subscribeDeliveryZones(setZones), []);
  return zones;
}
