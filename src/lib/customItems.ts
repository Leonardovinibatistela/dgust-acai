"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./firebase";

// Itens novos que o dono cria pelo painel (Cardápio > Adicionar item novo), sem precisar
// mexer no código. Ficam na coleção customMenuItems do Firestore e são somados ao cardápio
// que vem do banco, dentro da seção escolhida. Cada item tem um preço único.
// A foto (opcional) fica no documento como JPEG reduzido no navegador.

/** Seções onde dá pra criar item. "Monte seu Açaí" fica de fora: ela tem fluxo próprio (tamanhos e acompanhamentos). */
export const CUSTOM_CATEGORIES = [
  { id: "premium", label: "Açaí Premium" },
  { id: "garrafa", label: "Na Garrafa" },
  { id: "barca_marmita", label: "Barcas e Marmitas" },
  { id: "sobremesa", label: "Sobremesas" },
] as const;

export type CustomItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  /** quando foi criado (ms); null enquanto o servidor ainda não confirmou */
  addedAt: number | null;
};

// O item entra no cardápio como um produto comum. O id ganha o prefixo "custom-" pra nunca
// bater com o id de um produto do banco.
const ID_PREFIX = "custom-";
export const customProductId = (docId: string) => `${ID_PREFIX}${docId}`;
export const isCustomProductId = (productId: string) => productId.startsWith(ID_PREFIX);
export const customDocId = (productId: string) => productId.slice(ID_PREFIX.length);

/** Etiqueta "Novo" no cardápio: some sozinha depois desse tempo. */
const NEW_ITEM_DAYS = 14;
const isRecent = (addedAt: number | null) => addedAt !== null && Date.now() - addedAt < NEW_ITEM_DAYS * 24 * 60 * 60 * 1000;

/** Formato de produto usado pelo site e pelo painel (um único tamanho, "Único"). */
export function customItemToProduct(item: CustomItem) {
  return {
    id: customProductId(item.id),
    name: item.name,
    description: item.description,
    category: item.category,
    image: item.image || "/images/dgust-logo.jpg",
    sizes: JSON.stringify([{ label: "Único", price: item.price }]),
    freeToppingsLimit: 0,
    rating: "0",
    reviewsCount: 0,
    isFeatured: false,
    isNew: isRecent(item.addedAt),
  };
}

const itemsRef = () => collection(getDb(), "customMenuItems");

export function subscribeCustomItems(onUpdate: (items: CustomItem[]) => void): () => void {
  if (!isFirebaseConfigured) return () => {};
  return onSnapshot(
    query(itemsRef(), orderBy("createdAt", "asc")),
    (snapshot) =>
      onUpdate(
        snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            category: String(data.category ?? ""),
            name: String(data.name ?? ""),
            description: String(data.description ?? ""),
            price: Number(data.price) || 0,
            image: typeof data.image === "string" ? data.image : "",
            addedAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : null,
          };
        })
      ),
    (error) => console.warn("customMenuItems:", error)
  );
}

export type NewCustomItem = { category: string; name: string; description: string; price: number; image: string };

export const addCustomItem = (input: NewCustomItem) => addDoc(itemsRef(), { ...input, createdAt: serverTimestamp() });
export const removeCustomItem = (docId: string) => deleteDoc(doc(getDb(), "customMenuItems", docId));

/** null = ainda carregando (ou painel não configurado) */
export function useCustomItems(): CustomItem[] | null {
  const [items, setItems] = useState<CustomItem[] | null>(null);
  useEffect(() => subscribeCustomItems(setItems), []);
  return items;
}
