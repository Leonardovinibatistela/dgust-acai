"use client";

import { useState } from "react";
import { Check, ShieldOff, UserCheck, X } from "lucide-react";
import { approveAccess, rejectAccess, revokeAccess, SUPER_ADMIN_EMAIL, type AccessRequest, type AdminAccount } from "../lib/access";
import type { ConfirmFn } from "./useConfirm";
import { btn, btnDanger, btnPrimary, card, eyebrow } from "./ui";

const errorText = (error: unknown) => {
  const e = error as { code?: string; message?: string } | undefined;
  return `${e?.code ? `[${e.code}] ` : ""}${e?.message ?? String(error)}`;
};

const when = (ms: number | null) => (ms ? new Date(ms).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "agora");

export default function AccessPanel({
  requests,
  admins,
  listError,
  onError,
  confirm,
}: {
  requests: AccessRequest[];
  admins: AdminAccount[];
  listError: boolean;
  onError: (message: string) => void;
  confirm: ConfirmFn;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (id: string, task: () => Promise<unknown>, failure: string) => {
    setBusyId(id);
    try {
      await task();
    } catch (error) {
      onError(`${failure}\n\nDetalhe do erro: ${errorText(error)}`);
    } finally {
      setBusyId(null);
    }
  };

  const approve = async (request: AccessRequest) => {
    if (!(await confirm(`Autorizar ${request.name} (${request.email}) a entrar no painel? Ela vai poder ver os pedidos e mudar cardápio, preços e configurações.`, { confirmLabel: "Autorizar" }))) return;
    void run(request.id, () => approveAccess(request), "Não foi possível autorizar.");
  };

  const reject = async (request: AccessRequest) => {
    if (!(await confirm(`Negar o acesso de ${request.email}?`, { confirmLabel: "Negar acesso", danger: true }))) return;
    void run(request.id, () => rejectAccess(request), "Não foi possível negar.");
  };

  const revoke = async (account: AdminAccount) => {
    if (!(await confirm(`Tirar o acesso de ${account.name} (${account.email})? Ela deixa de conseguir entrar no painel na hora.`, { confirmLabel: "Tirar acesso", danger: true }))) return;
    void run(account.id, () => revokeAccess(account), "Não foi possível tirar o acesso.");
  };

  const pending = requests.filter((r) => r.status === "pending");
  const rejected = requests.filter((r) => r.status === "rejected");

  return (
    <div className="mt-8 space-y-6">
      <div className={card}>
        <p className={eyebrow}>Segurança</p>
        <h2 className="font-display mt-1 text-2xl font-semibold text-cream-50">Quem pode entrar no painel</h2>
        <p className="mt-2 text-sm leading-relaxed text-cream-100/75">
          Quem cria uma conta na tela de login e confirma o e-mail aparece aqui como pedido de acesso. Só entra no painel quem você autorizar. Se alguém perder o acesso, a própria pessoa recupera a senha pela tela de login; se perder o e-mail ou o celular, peça para criar uma conta nova, autorize ela e tire o acesso da antiga.
        </p>
        <p className="mt-3 text-xs text-cream-100/60">Responsável (sempre entra): {SUPER_ADMIN_EMAIL}</p>
      </div>

      {listError && <div className={`${card} text-sm text-red-300`}>Não foi possível carregar a lista de acessos. Recarregue a página; se continuar, confira se as regras do Firestore foram publicadas.</div>}

      <section className={card} aria-label="Pedidos de acesso">
        <p className={eyebrow}>Aguardando você</p>
        <h3 className="font-display mt-1 text-xl font-semibold text-cream-50">Pedidos de acesso{pending.length > 0 ? ` (${pending.length})` : ""}</h3>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-cream-100/70">Nenhum pedido no momento. Quando alguém criar uma conta e confirmar o e-mail, aparece aqui.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10">
            {pending.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-cream-50">{request.name}</p>
                  <p className="break-all text-sm text-cream-100/75">{request.email}</p>
                  <p className="text-xs text-cream-100/55">Pediu em {when(request.createdAt)} · e-mail confirmado</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => approve(request)} disabled={busyId === request.id} className={btnPrimary}>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Autorizar
                  </button>
                  <button type="button" onClick={() => reject(request)} disabled={busyId === request.id} className={btnDanger}>
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Negar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={card} aria-label="Contas autorizadas">
        <p className={eyebrow}>Com acesso</p>
        <h3 className="font-display mt-1 text-xl font-semibold text-cream-50">Contas autorizadas</h3>
        {admins.length === 0 ? (
          <p className="mt-3 text-sm text-cream-100/70">Só você tem acesso por enquanto.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10">
            {admins.map((account) => (
              <li key={account.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-cream-50">
                    <UserCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    {account.name}
                  </p>
                  <p className="break-all text-sm text-cream-100/75">{account.email}</p>
                  <p className="text-xs text-cream-100/55">Autorizada em {when(account.approvedAt)}</p>
                </div>
                <button type="button" onClick={() => revoke(account)} disabled={busyId === account.id} className={btnDanger}>
                  <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
                  Tirar acesso
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {rejected.length > 0 && (
        <section className={card} aria-label="Acessos negados">
          <p className={eyebrow}>Negados</p>
          <h3 className="font-display mt-1 text-xl font-semibold text-cream-50">Acessos negados</h3>
          <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10">
            {rejected.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-cream-50">{request.name}</p>
                  <p className="break-all text-sm text-cream-100/75">{request.email}</p>
                </div>
                <button type="button" onClick={() => approve(request)} disabled={busyId === request.id} className={btn}>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Autorizar mesmo assim
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
