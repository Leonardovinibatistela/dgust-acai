"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile, type User } from "firebase/auth";
import { LogOut, MailCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import { getAuthClient } from "../lib/firebase";
import { resendVerification, type AccessState } from "../lib/access";
import { btn, btnPrimary, card, eyebrow, input } from "./ui";

export const screen = "grid min-h-screen place-items-center bg-night-1000 px-5 py-10 text-cream-100";

const MIN_PASSWORD = 8;

const friendlyAuthError = (error: unknown): string => {
  const code = (error as { code?: string } | undefined)?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Esse e-mail já tem conta. Use \"Entrar\" ou \"Esqueci minha senha\".";
    case "auth/invalid-email":
      return "Esse e-mail não parece válido. Confira se digitou certo.";
    case "auth/weak-password":
      return `Escolha uma senha mais forte (pelo menos ${MIN_PASSWORD} caracteres).`;
    case "auth/too-many-requests":
      return "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.";
    case "auth/network-request-failed":
      return "Sem conexão com a internet. Confira e tente de novo.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-login-credentials":
      return "E-mail ou senha incorretos.";
    default:
      return "Não foi possível concluir. Tente de novo em instantes.";
  }
};

type Mode = "entrar" | "criar" | "esqueci";

/** Tela de entrada do painel: entrar, criar conta (precisa de autorização depois) e recuperar a senha. */
export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const goTo = (next: Mode) => {
    setMode(next);
    setError("");
    setInfo("");
    setPassword("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");
    const auth = getAuthClient();
    const cleanEmail = email.trim();

    if (mode === "criar") {
      if (name.trim().length < 2) return setError("Digite seu nome.");
      if (password.length < MIN_PASSWORD) return setError(`A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`);
    }

    setLoading(true);
    try {
      if (mode === "entrar") {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } else if (mode === "criar") {
        const { user } = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(user, { displayName: name.trim().slice(0, 80) });
        // Se o envio falhar, a próxima tela tem o botão "Reenviar e-mail".
        await sendEmailVerification(user).catch(() => undefined);
      } else {
        // Mesma resposta exista a conta ou não: ninguém descobre quem tem conta aqui.
        await sendPasswordResetEmail(auth, cleanEmail).catch((e) => {
          if ((e as { code?: string }).code !== "auth/user-not-found") throw e;
        });
        setInfo("Se esse e-mail tiver conta, enviamos um link para criar uma senha nova. Olhe também a caixa de spam.");
      }
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "entrar" ? "Painel de pedidos" : mode === "criar" ? "Criar conta" : "Recuperar senha";

  return (
    <div className={screen}>
      <form onSubmit={submit} className={`${card} w-full max-w-sm`}>
        <p className={eyebrow}>D&apos;Gust Açaí</p>
        <h1 className="font-display mt-1 text-3xl font-semibold text-cream-50">{title}</h1>

        {mode === "criar" && <p className="mt-2 text-sm leading-relaxed text-cream-100/75">Crie sua conta e confirme seu e-mail. O acesso ao painel só é liberado depois que o responsável autorizar.</p>}
        {mode === "esqueci" && <p className="mt-2 text-sm leading-relaxed text-cream-100/75">Digite o e-mail da sua conta. Vamos enviar um link para você criar uma senha nova.</p>}

        <div className="mt-6 space-y-3">
          {mode === "criar" && (
            <>
              <label className="sr-only" htmlFor="admin-name">
                Seu nome
              </label>
              <input id="admin-name" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className={input} />
            </>
          )}
          <label className="sr-only" htmlFor="admin-email">
            E-mail
          </label>
          <input id="admin-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className={input} />
          {mode !== "esqueci" && (
            <>
              <label className="sr-only" htmlFor="admin-password">
                Senha
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete={mode === "criar" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "criar" ? `Senha (mínimo ${MIN_PASSWORD} caracteres)` : "Senha"}
                className={input}
              />
            </>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-300">
            {error}
          </p>
        )}
        {info && (
          <p role="status" className="mt-3 text-sm text-emerald-300">
            {info}
          </p>
        )}

        <button type="submit" disabled={loading} className={`${btnPrimary} mt-5 w-full !py-3 !text-sm`}>
          {loading ? "Aguarde…" : mode === "entrar" ? "Entrar" : mode === "criar" ? "Criar conta" : "Enviar link"}
        </button>

        <div className="mt-5 flex flex-col gap-2 text-sm">
          {mode === "entrar" && (
            <>
              <button type="button" onClick={() => goTo("esqueci")} className="text-left text-acai-300 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400">
                Esqueci minha senha
              </button>
              <button type="button" onClick={() => goTo("criar")} className="text-left text-acai-300 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400">
                Ainda não tenho conta
              </button>
            </>
          )}
          {mode !== "entrar" && (
            <button type="button" onClick={() => goTo("entrar")} className="text-left text-acai-300 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400">
              Voltar para entrar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/** Telas de espera: e-mail por confirmar, aguardando autorização, acesso negado ou erro. */
export function AccessWaiting({ user, state, refresh }: { user: User; state: Exclude<AccessState, "super" | "approved">; refresh: () => Promise<void> }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (task: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setMessage("");
    try {
      await task();
      setMessage(done);
    } catch (e) {
      setMessage(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const content = {
    loading: { icon: <ShieldCheck className="h-6 w-6" />, title: "Carregando…", text: "" },
    unverified: {
      icon: <MailCheck className="h-6 w-6" />,
      title: "Confirme seu e-mail",
      text: `Enviamos um link para ${user.email}. Abra o e-mail, clique no link e volte aqui: esta tela atualiza sozinha. Se não achar, olhe a caixa de spam.`,
    },
    pending: {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Aguardando autorização",
      text: "Seu pedido de acesso foi enviado. Avise o responsável pelo sistema para autorizar. Quando ele liberar, esta tela entra no painel sozinha.",
    },
    rejected: {
      icon: <ShieldAlert className="h-6 w-6" />,
      title: "Acesso não autorizado",
      text: "Esta conta não tem permissão para entrar no painel. Se foi um engano, fale com o responsável pelo sistema.",
    },
    error: {
      icon: <ShieldAlert className="h-6 w-6" />,
      title: "Não deu para verificar seu acesso",
      text: "Confira sua internet e tente de novo. Se continuar, fale com o responsável pelo sistema.",
    },
  }[state];

  return (
    <div className={screen}>
      <div className={`${card} w-full max-w-sm text-center`}>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-acai-500/20 text-acai-200">{content.icon}</span>
        <h1 className="font-display mt-4 text-2xl font-semibold text-cream-50">{content.title}</h1>
        {content.text && <p className="mt-2 text-sm leading-relaxed text-cream-100/75">{content.text}</p>}
        <p className="mt-3 text-xs text-cream-100/60">Conta: {user.email}</p>

        {message && (
          <p role="status" className="mt-3 text-sm text-mango-300">
            {message}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {state === "unverified" && (
            <>
              <button type="button" disabled={busy} onClick={() => run(() => refresh(), "Ainda não apareceu como confirmado. Clique no link do e-mail e tente de novo.")} className={btnPrimary}>
                Já confirmei
              </button>
              <button type="button" disabled={busy} onClick={() => run(() => resendVerification(user), "E-mail reenviado. Olhe a caixa de entrada e o spam.")} className={btn}>
                Reenviar e-mail
              </button>
            </>
          )}
          {state === "error" && (
            <button type="button" disabled={busy} onClick={() => run(() => refresh(), "Verificando de novo…")} className={btnPrimary}>
              Tentar de novo
            </button>
          )}
          <button type="button" onClick={() => signOut(getAuthClient())} className={btn}>
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
