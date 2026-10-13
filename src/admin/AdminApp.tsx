"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { Clock, LogOut, Pause, Play } from "lucide-react";
import { getAuthClient, isFirebaseConfigured } from "../lib/firebase";
import { setEmergencyPause, setManualOpen, useMenuStatus } from "../lib/menuStatus";
import { formatManualOpenUntil, isManualOpenActive, isWithinStoreHours, MANUAL_OPEN_HOURS, STORE_HOURS_LABEL } from "../lib/storeHours";
import { subscribeToRecentOrders, type OrderRecord } from "./adminData";
import { useOrderAlerts } from "./useOrderAlerts";
import { useConfirm } from "./useConfirm";
import OrdersPanel from "./OrdersPanel";
import MenuPanel from "./MenuPanel";
import CombosPanel from "./CombosPanel";
import ZonesPanel from "./ZonesPanel";
import AccessPanel from "./AccessPanel";
import { AccessWaiting, AuthScreen } from "./AuthScreens";
import { useAccess, useAccessLists } from "../lib/access";
import { btn, btnDanger, btnOn, card, eyebrow } from "./ui";

type Tab = "pedidos" | "cardapio" | "combos" | "entrega" | "acessos";
const TABS: { id: Tab; label: string }[] = [
  { id: "pedidos", label: "Pedidos" },
  { id: "cardapio", label: "Cardápio" },
  { id: "combos", label: "Combo do dia" },
  { id: "entrega", label: "Entrega" },
];

const screen = "grid min-h-screen place-items-center bg-night-1000 px-5 text-cream-100";

export default function AdminApp() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = ainda carregando

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(getAuthClient(), setUser);
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <div className={screen}>
        <div className={`${card} max-w-md text-center`}>
          <h1 className="font-display text-2xl font-semibold text-cream-50">Painel ainda não configurado</h1>
          <p className="mt-2 text-sm leading-relaxed text-cream-100/75">Faltam as variáveis NEXT_PUBLIC_FIREBASE_* deste ambiente. Cadastre a configuração do Firebase e publique de novo.</p>
        </div>
      </div>
    );
  }
  if (user === undefined) return <div className={`${screen} text-cream-100/75`}>Carregando…</div>;
  return user ? <AccessGate user={user} /> : <AuthScreen />;
}

// Só entra no painel quem é o responsável ou foi autorizado por ele. As outras pessoas
// (conta nova, e-mail por confirmar, aguardando, negada) veem uma tela de espera.
function AccessGate({ user }: { user: User }) {
  const { state, refresh } = useAccess(user);
  if (state === "loading") return <div className={`${screen} text-cream-100/75`}>Carregando…</div>;
  if (state === "super" || state === "approved") return <Dashboard user={user} isSuper={state === "super"} />;
  return <AccessWaiting user={user} state={state} refresh={refresh} />;
}

function Dashboard({ user, isSuper }: { user: User; isSuper: boolean }) {
  const [tab, setTab] = useState<Tab>("pedidos");
  const [notice, setNotice] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [ordersError, setOrdersError] = useState("");
  const [togglingPause, setTogglingPause] = useState(false);
  const [togglingOpen, setTogglingOpen] = useState(false);
  const [clock, setClock] = useState(() => new Date());

  const status = useMenuStatus();
  const alerts = useOrderAlerts(orders, setNotice);
  const { confirm, dialog } = useConfirm();
  // Só o responsável vê (e carrega) a aba Acessos.
  const access = useAccessLists(isSuper);
  const pendingCount = access.requests.filter((r) => r.status === "pending").length;
  const tabs = isSuper ? [...TABS, { id: "acessos" as Tab, label: pendingCount > 0 ? `Acessos (${pendingCount})` : "Acessos" }] : TABS;

  useEffect(() => subscribeToRecentOrders(setOrders, () => setOrdersError("Não foi possível carregar os pedidos. Confira se seu e-mail está liberado nas regras do Firestore.")), []);

  // Relógio só pra o selo "Aberto/Fechado" acompanhar o horário sem recarregar.
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const manualActive = isManualOpenActive(status.manualOpen, clock);
  const storeOpen = isWithinStoreHours(clock) || manualActive;

  const togglePause = async () => {
    const next = !status.paused;
    if (next && !(await confirm("Pausar pedidos agora? O site continua no ar, mas ninguém consegue finalizar pedido até você reativar.", { confirmLabel: "Pausar pedidos", danger: true }))) return;
    setTogglingPause(true);
    setEmergencyPause(next)
      .catch(() => setNotice("Não foi possível atualizar a pausa. Tente de novo."))
      .finally(() => setTogglingPause(false));
  };

  const toggleManualOpen = () => {
    setTogglingOpen(true);
    setManualOpen(!manualActive)
      .catch(() => setNotice("Não foi possível atualizar a abertura. Tente de novo."))
      .finally(() => setTogglingOpen(false));
  };

  if (ordersError) return <div className={`${screen} text-center`}>{ordersError}</div>;

  const statusLabel = status.paused ? "Pedidos pausados" : storeOpen ? "Aberto para pedidos" : "Fechado";
  const statusStyle = status.paused ? "bg-red-400/15 text-red-300" : storeOpen ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-cream-100/80";

  return (
    <div className="min-h-screen bg-night-1000 px-5 py-8 text-cream-100 sm:px-8">
      {notice && (
        <div role="alert" className="sticky top-3 z-50 mx-auto mb-5 max-w-5xl rounded-2xl border border-red-400/40 bg-night-900 p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <p className="whitespace-pre-line text-sm font-semibold text-red-300">{notice}</p>
            <button type="button" onClick={() => setNotice(null)} className={btn}>
              Fechar
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={eyebrow}>D&apos;Gust Açaí · Painel</p>
            <h1 className="font-display mt-1 text-3xl font-semibold text-cream-50">Olá, {user.email}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-cream-100/75">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}>{statusLabel}</span>
              <span>{STORE_HOURS_LABEL}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePause}
              disabled={togglingPause}
              aria-pressed={status.paused}
              title="Emergência (cozinha lotou, faltou algo)? Pausa o envio de pedidos no site na hora, sem mexer no horário."
              className={status.paused ? btnDanger : btn}
            >
              {status.paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
              {status.paused ? "Pausado: reativar pedidos" : "Pausar pedidos"}
            </button>
            <button
              type="button"
              onClick={toggleManualOpen}
              disabled={togglingOpen}
              aria-pressed={manualActive}
              title={`Abre o site para pedidos por ${MANUAL_OPEN_HOURS} horas, mesmo fora do horário. Fecha sozinho depois, não precisa lembrar de desligar.`}
              className={manualActive ? btnOn : btn}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {manualActive && status.manualOpen.until !== null ? `Aberto até ${formatManualOpenUntil(status.manualOpen.until)} (desligar)` : manualActive ? "Aberto agora (desligar)" : "Abrir agora"}
            </button>
            <button type="button" onClick={() => signOut(getAuthClient())} className={btn}>
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sair
            </button>
          </div>
        </header>

        <div role="tablist" aria-label="Seções do painel" className="mt-6 flex gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-night-900/80 p-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400 ${tab === t.id ? "bg-gradient-to-r from-acai-600 to-fuchsia-500 text-white" : "text-cream-100/75 hover:text-cream-50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "pedidos" && <OrdersPanel orders={orders} alerts={alerts} onError={setNotice} confirm={confirm} />}
        {tab === "cardapio" && <MenuPanel status={status} onError={setNotice} confirm={confirm} />}
        {tab === "combos" && <CombosPanel onError={setNotice} confirm={confirm} />}
        {tab === "entrega" && <ZonesPanel onError={setNotice} confirm={confirm} />}
        {tab === "acessos" && isSuper && <AccessPanel requests={access.requests} admins={access.admins} listError={access.error} onError={setNotice} confirm={confirm} />}
      </div>
      {dialog}
    </div>
  );
}
