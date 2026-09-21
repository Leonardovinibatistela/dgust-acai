"use client";

import dynamic from "next/dynamic";

// O painel usa Firebase Auth, Web Bluetooth e Web Audio: só existem no navegador,
// então não é renderizado no servidor.
const AdminApp = dynamic(() => import("../../admin/AdminApp"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-night-1000 text-cream-100/75">Carregando…</div>,
});

export default function AdminPage() {
  return <AdminApp />;
}
