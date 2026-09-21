"use client";

import { useEffect, useState } from "react";
import { Bell, MessageCircle, Printer, Trash2 } from "lucide-react";
import {
  bestSellers,
  deleteOrder,
  endOfDay,
  fetchOrdersBetween,
  ordersInRange,
  startOfDay,
  startOfMonth,
  startOfWeek,
  sumRevenue,
  type OrderRecord,
} from "./adminData";
import type { OrderAlerts } from "./useOrderAlerts";
import { brl, btn, btnDanger, card, eyebrow, input } from "./ui";

const PAYMENT_LABELS: Record<string, string> = { pix: "Pix", cartao: "Cartão", dinheiro: "Dinheiro" };
const NEW_ORDER_WINDOW_MS = 3 * 60 * 1000;

const toDateInputValue = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

// Telefone do cliente -> link do WhatsApp (assume Brasil quando vier só DDD + número).
const whatsappLink = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
};

function StatCard({ label, revenue, count, highlight }: { label: string; revenue: number; count: number; highlight?: boolean }) {
  return (
    <div className={`min-w-0 rounded-2xl border p-5 ${highlight ? "border-acai-400/40 bg-acai-600/15" : "border-white/10 bg-night-900/80"}`}>
      <p className={eyebrow}>{label}</p>
      <p className="font-display mt-2 text-3xl font-semibold text-cream-50">{brl(revenue)}</p>
      <p className="mt-1 text-sm text-cream-100/70">
        <strong className="font-semibold text-cream-50">{count}</strong> pedido{count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function OrderCard({ order, alerts, deleting, onDelete }: { order: OrderRecord; alerts: OrderAlerts; deleting: boolean; onDelete: (order: OrderRecord) => void }) {
  const isNew = Date.now() - order.createdAt.getTime() < NEW_ORDER_WINDOW_MS;
  const chat = whatsappLink(order.customerPhone);
  const meta = "mt-1 text-sm text-cream-100/75";

  return (
    <article className={`rounded-xl border p-4 ${isNew ? "border-mango-400/60 bg-mango-400/[0.07]" : "border-white/10 bg-night-950/60"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-base font-semibold text-cream-50">
          Pedido #{order.orderNumber}
          {isNew && <span className="rounded-full bg-mango-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-night-1000">Novo</span>}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-cream-100/70">{order.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          {chat && (
            <a href={chat} target="_blank" rel="noreferrer" className={btn} aria-label={`Chamar ${order.customerName || "cliente"} no WhatsApp`}>
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              WhatsApp
            </a>
          )}
          {alerts.printerConn && (
            <button type="button" onClick={() => alerts.print(order)} disabled={alerts.printingId === order.id} className={btn} aria-label={`Imprimir Pedido #${order.orderNumber}`}>
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              {alerts.printingId === order.id ? "Imprimindo…" : "Imprimir"}
            </button>
          )}
          <button type="button" onClick={() => onDelete(order)} disabled={deleting} className={btnDanger} aria-label={`Apagar Pedido #${order.orderNumber}`}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {deleting ? "Apagando…" : "Apagar"}
          </button>
        </div>
      </div>

      {(order.customerName || order.customerPhone) && (
        <p className={meta}>
          Cliente: <span className="font-semibold text-cream-50">{order.customerName}</span>
          {order.customerName && order.customerPhone ? " · " : ""}
          {order.customerPhone}
        </p>
      )}
      {order.deliveryType === "entrega" && (
        <p className={meta}>
          Entrega{order.location.trim() ? `: ${order.location.trim()}` : ""}
        </p>
      )}
      {order.deliveryType === "retirada" && <p className={meta}>Retirada no local</p>}
      {order.paymentMethod && (
        <p className={meta}>
          Pagamento: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          {order.paymentMethod === "dinheiro" && order.changeFor.trim() ? ` · troco para R$ ${order.changeFor.trim()}` : ""}
        </p>
      )}
      {order.notes.trim() && <p className="mt-1 text-sm font-semibold text-mango-300">Observação: {order.notes.trim()}</p>}

      <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
        {order.items.map((item, index) => (
          <li key={`${item.id}-${index}`} className={`flex items-baseline justify-between gap-3 text-sm ${item.parentId ? "pl-4 text-cream-100/70" : "font-semibold text-cream-50"}`}>
            <span>
              {item.parentId ? "+ " : `${item.quantity}x `}
              {item.name}
            </span>
            {item.lineTotal > 0 && <span className="shrink-0">{brl(item.lineTotal)}</span>}
          </li>
        ))}
      </ul>

      <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm">
        {order.deliveryFee > 0 && (
          <div className="flex justify-between text-cream-100/75">
            <span>Taxa de entrega</span>
            <span>{brl(order.deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold text-mango-300">
          <span>Total</span>
          <span>{brl(order.total)}</span>
        </div>
      </div>
    </article>
  );
}

export default function OrdersPanel({ orders, alerts, onError }: { orders: OrderRecord[] | null; alerts: OrderAlerts; onError: (message: string) => void }) {
  const [pickedDate, setPickedDate] = useState(() => toDateInputValue(new Date()));
  const [pickedOrders, setPickedOrders] = useState<OrderRecord[] | null>(null);
  const [loadingPicked, setLoadingPicked] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const now = new Date();
  const todayOrders = orders ? ordersInRange(orders, startOfDay(now)) : [];
  const weekOrders = orders ? ordersInRange(orders, startOfWeek(now)) : [];
  const monthOrders = orders ? ordersInRange(orders, startOfMonth(now)) : [];
  const isToday = pickedDate === toDateInputValue(now);

  // Dia diferente de hoje: busca uma vez. Hoje: usa a lista ao vivo (atualiza sozinha).
  useEffect(() => {
    if (isToday) return;
    const [year, month, day] = pickedDate.split("-").map(Number);
    if (!year || !month || !day) return;
    const picked = new Date(year, month - 1, day);
    let cancelled = false;
    setLoadingPicked(true);
    fetchOrdersBetween(startOfDay(picked), endOfDay(picked))
      .then((result) => !cancelled && setPickedOrders(result))
      .catch(() => !cancelled && onError("Não foi possível buscar os pedidos dessa data."))
      .finally(() => !cancelled && setLoadingPicked(false));
    return () => {
      cancelled = true;
    };
  }, [pickedDate, isToday, onError]);

  const listedOrders = isToday ? todayOrders : pickedOrders ?? [];
  const sortedOrders = [...listedOrders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const top3 = bestSellers(monthOrders, 3);

  const handleDelete = (order: OrderRecord) => {
    if (!window.confirm(`Apagar o Pedido #${order.orderNumber}? Essa ação não pode ser desfeita.`)) return;
    setDeletingId(order.id);
    deleteOrder(order.id)
      .then(() => {
        if (!isToday) setPickedOrders((current) => (current ? current.filter((o) => o.id !== order.id) : current));
      })
      .catch(() => onError(`Não foi possível apagar o Pedido #${order.orderNumber}. Tente de novo.`))
      .finally(() => setDeletingId(null));
  };

  if (!orders) return <div className={`${card} mt-8 text-center text-sm text-cream-100/75`}>Carregando pedidos…</div>;

  return (
    <div className="mt-8 space-y-8">
      <section aria-label="Resumo de vendas" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Hoje" revenue={sumRevenue(todayOrders)} count={todayOrders.length} highlight />
        <StatCard label="Esta semana" revenue={sumRevenue(weekOrders)} count={weekOrders.length} />
        <StatCard label="Este mês" revenue={sumRevenue(monthOrders)} count={monthOrders.length} />
      </section>

      <section className={card} aria-label="Impressora e som">
        <p className={eyebrow}>Avisos de pedido novo</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          {alerts.printerConn ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              Impressora conectada{alerts.printerConn.device.name ? `: ${alerts.printerConn.device.name}` : ""}
            </span>
          ) : (
            <button type="button" onClick={alerts.connect} disabled={alerts.connecting} className={btn}>
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              {alerts.connecting ? "Conectando…" : "Conectar impressora"}
            </button>
          )}
          <label className={`inline-flex items-center gap-2 text-sm ${alerts.printerConn ? "text-cream-100" : "text-cream-100/50"}`}>
            <input type="checkbox" checked={alerts.autoPrint} onChange={alerts.toggleAutoPrint} disabled={!alerts.printerConn} className="h-4 w-4 accent-acai-500" />
            Imprimir pedidos novos automaticamente
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-cream-100">
            <input type="checkbox" checked={alerts.soundEnabled} onChange={alerts.toggleSound} className="h-4 w-4 accent-acai-500" />
            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
            Som de pedido novo
          </label>
          <label className={`inline-flex items-center gap-2 text-sm ${alerts.soundEnabled ? "text-cream-100" : "text-cream-100/50"}`}>
            Volume
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={alerts.soundVolume}
              disabled={!alerts.soundEnabled}
              onChange={(event) => alerts.changeVolume(Number(event.target.value))}
              className="h-1.5 w-28 accent-acai-500 disabled:opacity-40"
            />
            <button type="button" onClick={alerts.testSound} disabled={!alerts.soundEnabled} className={btn}>
              Testar
            </button>
          </label>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-cream-100/60">A impressora usa Bluetooth e só funciona no Chrome (computador ou Android). No iPhone não funciona.</p>
      </section>

      <section aria-label="Pedidos">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={eyebrow}>{isToday ? "Ao vivo" : "Histórico"}</p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-cream-50">{isToday ? "Pedidos de hoje" : "Pedidos do dia escolhido"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="picked-date" className="text-xs text-cream-100/70">
              Ver outro dia
            </label>
            <input id="picked-date" type="date" value={pickedDate} max={toDateInputValue(now)} onChange={(event) => event.target.value && setPickedDate(event.target.value)} className={`${input} !w-auto`} />
            {!isToday && (
              <button type="button" onClick={() => setPickedDate(toDateInputValue(new Date()))} className={btn}>
                Voltar pra hoje
              </button>
            )}
          </div>
        </div>

        {loadingPicked ? (
          <p className="mt-6 text-sm text-cream-100/75">Buscando…</p>
        ) : sortedOrders.length === 0 ? (
          <div className={`${card} mt-5 text-center`}>
            <p className="font-semibold text-cream-50">{isToday ? "Nenhum pedido hoje ainda." : "Nenhum pedido nesse dia."}</p>
            {isToday && <p className="mt-1 text-sm text-cream-100/70">Quando um cliente fizer um pedido no site, ele aparece aqui na hora e o sino toca.</p>}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {sortedOrders.map((order) => (
              <OrderCard key={order.id} order={order} alerts={alerts} deleting={deletingId === order.id} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>

      <section className={card} aria-label="Mais vendidos do mês">
        <p className={eyebrow}>Este mês</p>
        <h2 className="font-display mt-1 text-xl font-semibold text-cream-50">Os 3 mais vendidos</h2>
        {top3.length === 0 ? (
          <p className="mt-3 text-sm text-cream-100/70">Sem pedidos ainda neste mês.</p>
        ) : (
          <ol className="mt-4 space-y-2.5">
            {top3.map((item, index) => (
              <li key={item.name} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-acai-500/20 text-xs font-bold text-acai-200">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-cream-50">{item.name}</span>
                <span className="shrink-0 text-sm text-cream-100/70">{item.quantity}x</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
