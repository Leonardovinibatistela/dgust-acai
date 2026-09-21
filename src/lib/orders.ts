import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { getDb } from "./firebase";

// Uma linha do pedido. O produto (com tamanho) é a linha "pai"; cada topping
// escolhido vira uma linha "filha" logo abaixo, apontando pro pai via parentId
// (grátis = unitPrice 0). A ordem do array é a ordem de exibição/impressão.
export type OrderLineItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  parentId?: string;
};

export type OrderPayload = {
  customerName: string;
  customerPhone: string;
  items: OrderLineItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: "retirada" | "entrega";
  location: string;
  paymentMethod: "pix" | "cartao" | "dinheiro";
  changeFor: string;
  notes: string;
};

// O número do pedido acumula (não reinicia todo dia) e volta pro 1 depois do 100.
export const MAX_ORDER_NUMBER = 100;
const computeNextOrderNumber = (current: number | undefined): number => ((current ?? 0) >= MAX_ORDER_NUMBER ? 1 : (current ?? 0) + 1);

/**
 * Grava o pedido no Firestore com número sequencial real (transação atômica no
 * contador). Quem chama trata a falha (ex.: sem internet) e segue pro WhatsApp
 * mesmo assim — o pedido nunca trava por causa do painel.
 */
export async function registerOrder(payload: OrderPayload): Promise<number> {
  const db = getDb();
  const countersRef = doc(db, "counters", "orders");
  return runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(countersRef);
    const current = counterSnap.exists() ? (counterSnap.data().current as number | undefined) : undefined;
    const next = computeNextOrderNumber(current);
    transaction.set(countersRef, { current: next });
    transaction.set(doc(collection(db, "orders")), { ...payload, orderNumber: next, createdAt: serverTimestamp() });
    return next;
  });
}
