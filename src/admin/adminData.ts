import { collection, deleteDoc, doc, getDocs, onSnapshot, query, QuerySnapshot, Timestamp, where } from "firebase/firestore";
import { getDb } from "../lib/firebase";
import type { OrderLineItem } from "../lib/orders";

export type OrderRecord = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  items: OrderLineItem[];
  subtotal: number;
  total: number;
  /** Taxa de entrega cobrada do cliente (já está dentro de `total`). 0 na retirada. */
  deliveryFee: number;
  notes: string;
  createdAt: Date;
  paymentMethod: "pix" | "cartao" | "dinheiro" | "";
  changeFor: string;
  deliveryType: "retirada" | "entrega" | "";
  location: string;
};

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 1);
  return d;
}

export function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 = domingo
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
}

function mapSnapshotToOrders(snapshot: QuerySnapshot): OrderRecord[] {
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
    return {
      id: docSnap.id,
      orderNumber: data.orderNumber ?? 0,
      customerName: data.customerName ?? "",
      customerPhone: data.customerPhone ?? "",
      items: data.items ?? [],
      subtotal: typeof data.subtotal === "number" ? data.subtotal : data.total ?? 0,
      total: data.total ?? 0,
      deliveryFee: typeof data.deliveryFee === "number" ? data.deliveryFee : 0,
      notes: data.notes ?? "",
      createdAt,
      paymentMethod: data.paymentMethod ?? "",
      changeFor: data.changeFor ?? "",
      deliveryType: data.deliveryType ?? "",
      location: data.location ?? "",
    };
  });
}

/** Busca pedidos entre duas datas (pesquisa de um dia ou mês específico). */
export async function fetchOrdersBetween(from: Date, to: Date): Promise<OrderRecord[]> {
  const ordersQuery = query(collection(getDb(), "orders"), where("createdAt", ">=", Timestamp.fromDate(from)), where("createdAt", "<", Timestamp.fromDate(to)));
  return mapSnapshotToOrders(await getDocs(ordersQuery));
}

/**
 * Pedidos desde o início da semana ou do mês (o que vier primeiro) — cobre
 * hoje/semana/mês numa consulta só, ao vivo: chama onUpdate toda vez que um
 * pedido novo chega. Retorna a função pra parar de escutar.
 */
export function subscribeToRecentOrders(onUpdate: (orders: OrderRecord[]) => void, onError: (error: unknown) => void): () => void {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const weekStart = startOfWeek(now);
  const queryStart = weekStart < monthStart ? weekStart : monthStart;
  const ordersQuery = query(collection(getDb(), "orders"), where("createdAt", ">=", Timestamp.fromDate(queryStart)));
  return onSnapshot(ordersQuery, (snapshot) => onUpdate(mapSnapshotToOrders(snapshot)), onError);
}

export function sumRevenue(orders: OrderRecord[]) {
  return orders.reduce((total, order) => total + order.total, 0);
}

/** Ranking dos açaís mais vendidos: só as linhas "pai" (toppings não entram). */
export function bestSellers(orders: OrderRecord[], limit: number) {
  const quantityByItem = new Map<string, number>();
  orders.forEach((order) =>
    order.items.forEach((item) => {
      if (item.parentId) return;
      quantityByItem.set(item.name, (quantityByItem.get(item.name) ?? 0) + item.quantity);
    })
  );
  return Array.from(quantityByItem.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

/** Apaga um pedido (ex.: teste ou duplicado) — só o admin autenticado pode. */
export function deleteOrder(id: string): Promise<void> {
  return deleteDoc(doc(getDb(), "orders", id));
}

export function ordersInRange(orders: OrderRecord[], from: Date, to?: Date) {
  return orders.filter((order) => order.createdAt >= from && (!to || order.createdAt < to));
}

const weekdayLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/** Soma o faturamento por dia da semana (domingo a sábado, nessa ordem). */
export function revenueByWeekday(orders: OrderRecord[]) {
  const totals = [0, 0, 0, 0, 0, 0, 0];
  orders.forEach((order) => {
    totals[order.createdAt.getDay()] += order.total;
  });
  return weekdayLabels.map((label, index) => ({ label, total: totals[index] }));
}
