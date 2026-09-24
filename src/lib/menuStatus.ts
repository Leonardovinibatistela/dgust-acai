"use client";

import { useEffect, useState } from "react";
import { arrayRemove, arrayUnion, collection, deleteDoc, deleteField, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./firebase";
import { MANUAL_OPEN_HOURS, type ManualOpen } from "./storeHours";

// Tudo que o painel controla (esgotado, preço, nome, descrição, excluir do
// site, pausa de emergência, abertura antecipada) fica em UM documento por
// assunto dentro de menuStatus/. O site público e o painel assinam os mesmos
// documentos, então o que muda no painel aparece pro cliente na hora.
//
// Ids: o produto usa o id do banco (ex.: "acai-ninho-nutella"); cada tamanho
// vira um item próprio "<produto>:<tamanho>" (ex.: "acai-ninho-nutella:500ml").
// Preço e esgotado valem por tamanho; nome, descrição e excluir valem pro produto.

export type Unsubscribe = () => void;
const noop: Unsubscribe = () => {};

export const sizeSlug = (label: string) =>
  label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const itemId = (productId: string, sizeLabel: string) => `${productId}:${sizeSlug(sizeLabel)}`;

const statusRef = (name: string) => doc(getDb(), "menuStatus", name);

function listen<T>(name: string, read: (data: Record<string, unknown> | undefined) => T, onUpdate: (value: T) => void, onError?: (error: unknown) => void): Unsubscribe {
  if (!isFirebaseConfigured) return noop;
  return onSnapshot(
    statusRef(name),
    (snap) => onUpdate(read(snap.exists() ? snap.data() : undefined)),
    onError ?? ((error) => console.warn(`menuStatus/${name}:`, error))
  );
}

const readIdSet = (data: Record<string, unknown> | undefined) => new Set<string>((data?.itemIds as string[] | undefined) ?? []);
const readMap = <V,>(field: string) => (data: Record<string, unknown> | undefined) => ((data?.[field] as Record<string, V> | undefined) ?? {});

// --- esgotado e excluído: lista de ids ---
export const subscribeSoldOut = (onUpdate: (ids: Set<string>) => void) => listen("soldOut", readIdSet, onUpdate);
export const setItemSoldOut = (id: string, soldOut: boolean) =>
  setDoc(statusRef("soldOut"), { itemIds: soldOut ? arrayUnion(id) : arrayRemove(id) }, { merge: true });

export const subscribeHidden = (onUpdate: (ids: Set<string>) => void) => listen("hiddenItems", readIdSet, onUpdate);
export const setItemHidden = (id: string, hidden: boolean) =>
  setDoc(statusRef("hiddenItems"), { itemIds: hidden ? arrayUnion(id) : arrayRemove(id) }, { merge: true });

// --- preço, nome, descrição: mapa { id: valor } ---
// Objeto aninhado de verdade ({ prices: { [id]: valor } }): uma chave com ponto
// literal ("prices.x") NÃO faz merge dentro do mapa com setDoc — cria um campo
// com ponto no nome que ninguém lê.
export const subscribePrices = (onUpdate: (prices: Record<string, number>) => void) => listen("priceOverrides", readMap<number>("prices"), onUpdate);
export const setItemPrice = (id: string, price: number) => setDoc(statusRef("priceOverrides"), { prices: { [id]: price } }, { merge: true });
export const clearItemPrice = (id: string) => setDoc(statusRef("priceOverrides"), { prices: { [id]: deleteField() } }, { merge: true });

export const subscribeNames = (onUpdate: (names: Record<string, string>) => void) => listen("nameOverrides", readMap<string>("names"), onUpdate);
export const setItemName = (id: string, name: string) => setDoc(statusRef("nameOverrides"), { names: { [id]: name } }, { merge: true });
export const clearItemName = (id: string) => setDoc(statusRef("nameOverrides"), { names: { [id]: deleteField() } }, { merge: true });

export const subscribeDescriptions = (onUpdate: (descriptions: Record<string, string>) => void) => listen("descriptionOverrides", readMap<string>("descriptions"), onUpdate);
export const setItemDescription = (id: string, description: string) => setDoc(statusRef("descriptionOverrides"), { descriptions: { [id]: description } }, { merge: true });
export const clearItemDescription = (id: string) => setDoc(statusRef("descriptionOverrides"), { descriptions: { [id]: deleteField() } }, { merge: true });

// --- fotos trocadas pelo painel ---
// Uma foto por produto, guardada no próprio Firestore (coleção menuPhotos, id = id do
// produto) como imagem JPEG já reduzida no navegador (~100 KB). Serve pra demonstração e
// pra poucas trocas: o Firebase grátis não tem armazenamento de arquivos. Com muitas fotos
// trocadas, o ideal é migrar pra um serviço de imagens (Cloudinary, por exemplo).
export const subscribePhotos = (onUpdate: (photos: Record<string, string>) => void): Unsubscribe => {
  if (!isFirebaseConfigured) return noop;
  return onSnapshot(
    collection(getDb(), "menuPhotos"),
    (snap) => {
      const photos: Record<string, string> = {};
      snap.forEach((d) => {
        const image = d.data().image;
        if (typeof image === "string") photos[d.id] = image;
      });
      onUpdate(photos);
    },
    (error) => console.warn("menuPhotos:", error)
  );
};
export const setProductPhoto = (productId: string, image: string) => setDoc(doc(getDb(), "menuPhotos", productId), { image, updatedAt: serverTimestamp() });
export const clearProductPhoto = (productId: string) => deleteDoc(doc(getDb(), "menuPhotos", productId));

// --- pausa de emergência e abertura antecipada ---
export const subscribeEmergencyPause = (onUpdate: (paused: boolean) => void) => listen("emergencyPause", (d) => !!d?.paused, onUpdate);
export const setEmergencyPause = (paused: boolean) => setDoc(statusRef("emergencyPause"), { paused }, { merge: true });

export const subscribeManualOpen = (onUpdate: (state: ManualOpen) => void) =>
  listen("manualOpen", (d) => ({ open: !!d?.open, until: typeof d?.until === "number" ? d.until : null }), onUpdate);
/** Liga por MANUAL_OPEN_HOURS horas (guarda o horário de término) ou desliga. */
export const setManualOpen = (open: boolean) =>
  setDoc(statusRef("manualOpen"), open ? { open: true, until: Date.now() + MANUAL_OPEN_HOURS * 3600 * 1000 } : { open: false, until: null }, { merge: true });

// --- hook único usado pelo site público e pelo painel ---
export type MenuStatus = {
  soldOut: Set<string>;
  hidden: Set<string>;
  prices: Record<string, number>;
  names: Record<string, string>;
  descriptions: Record<string, string>;
  photos: Record<string, string>;
  paused: boolean;
  manualOpen: ManualOpen;
};

const EMPTY_STATUS: MenuStatus = { soldOut: new Set(), hidden: new Set(), prices: {}, names: {}, descriptions: {}, photos: {}, paused: false, manualOpen: { open: false, until: null } };

export function useMenuStatus(): MenuStatus {
  const [status, setStatus] = useState<MenuStatus>(EMPTY_STATUS);
  useEffect(() => {
    const patch = <K extends keyof MenuStatus>(key: K) => (value: MenuStatus[K]) => setStatus((prev) => ({ ...prev, [key]: value }));
    const stops = [
      subscribeSoldOut(patch("soldOut")),
      subscribeHidden(patch("hidden")),
      subscribePrices(patch("prices")),
      subscribeNames(patch("names")),
      subscribeDescriptions(patch("descriptions")),
      subscribePhotos(patch("photos")),
      subscribeEmergencyPause(patch("paused")),
      subscribeManualOpen(patch("manualOpen")),
    ];
    return () => stops.forEach((stop) => stop());
  }, []);
  return status;
}

// --- aplica os ajustes do painel em cima do cardápio que vem do banco ---
export type SizeOption = { label: string; price: number; soldOut?: boolean };

export function applyMenuStatus<P extends { id: string; name: string; description: string; image: string; sizes: string }>(products: P[], status: MenuStatus): P[] {
  return products
    .filter((p) => !status.hidden.has(p.id))
    .map((p) => {
      const sizes = (JSON.parse(p.sizes) as SizeOption[]).map((size) => {
        const id = itemId(p.id, size.label);
        return { label: size.label, price: status.prices[id] ?? size.price, soldOut: status.soldOut.has(id) || status.soldOut.has(p.id) };
      });
      return { ...p, name: status.names[p.id] ?? p.name, description: status.descriptions[p.id] ?? p.description, image: status.photos[p.id] ?? p.image, sizes: JSON.stringify(sizes) };
    });
}
