"use client";

import { useCallback, useEffect, useState } from "react";
import { sendEmailVerification, type User } from "firebase/auth";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { getDb } from "./firebase";

// Controle de quem entra no painel.
//
// - O responsável (SUPER_ADMIN_EMAIL) sempre entra e é o único que autoriza os outros.
//   Esse e-mail também está fixo em firestore.rules: se mudar aqui, mude lá.
// - Qualquer pessoa pode criar conta na tela de login, mas só "pede acesso" depois de
//   confirmar o e-mail (assim ninguém se passa por outra pessoa). O pedido fica pendente
//   até o responsável autorizar na aba "Acessos". Sem autorização, o painel e os pedidos
//   continuam bloqueados — quem barra de verdade são as regras do Firestore, não esta tela.
export const SUPER_ADMIN_EMAIL = "lv6696184@gmail.com";

export const isSuperAdminEmail = (email: string | null | undefined) => (email ?? "").trim().toLowerCase() === SUPER_ADMIN_EMAIL;

export type AccessRequest = { id: string; email: string; name: string; status: "pending" | "rejected"; createdAt: number | null };
export type AdminAccount = { id: string; email: string; name: string; approvedAt: number | null };

type Millis = { toMillis: () => number };
const millis = (value: unknown): number | null => (value && typeof (value as Millis).toMillis === "function" ? (value as Millis).toMillis() : null);

const requestsRef = () => collection(getDb(), "accessRequests");
const adminsRef = () => collection(getDb(), "admins");

export type AccessState =
  | "loading"
  | "super" // responsável: sempre entra
  | "approved" // autorizada pelo responsável
  | "unverified" // criou a conta mas ainda não confirmou o e-mail
  | "pending" // aguardando o responsável autorizar
  | "rejected" // o responsável negou (ou removeu) o acesso
  | "error";

const displayNameFor = (user: User) => (user.displayName?.trim() || (user.email ?? "").split("@")[0] || "Sem nome").slice(0, 80);

/**
 * Descobre em que etapa do acesso a pessoa logada está e, quando já confirmou o e-mail e
 * ainda não tem pedido, cria o pedido de acesso sozinho. `refresh` pede pro Firebase
 * reler a conta (usado quando a pessoa clica no link do e-mail).
 */
export function useAccess(user: User): { state: AccessState; refresh: () => Promise<void> } {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<AccessState>("loading");
  const isSuper = isSuperAdminEmail(user.email);
  const verified = user.emailVerified;

  const refresh = useCallback(async () => {
    await user.reload();
    if (user.emailVerified) await user.getIdToken(true); // o "e-mail confirmado" só vai pro token depois disso
    setTick((n) => n + 1);
  }, [user]);

  // Enquanto não confirmou o e-mail, confere sozinho a cada poucos segundos.
  useEffect(() => {
    if (isSuper || verified) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh().catch(() => undefined);
    }, 4000);
    return () => clearInterval(timer);
  }, [isSuper, verified, refresh]);

  useEffect(() => {
    if (isSuper) {
      setState("super");
      return;
    }
    if (!verified) {
      setState("unverified");
      return;
    }
    setState("loading");
    const db = getDb();
    let adminExists = false;
    let request: AccessRequest["status"] | null | undefined; // undefined = ainda não respondeu
    let adminAnswered = false;
    let creating = false;

    const decide = () => {
      if (!adminAnswered || request === undefined) return;
      if (adminExists) return setState("approved");
      if (request === "pending") return setState("pending");
      if (request === "rejected") return setState("rejected");
      // Sem pedido ainda: cria um (as regras só deixam quem tem e-mail confirmado).
      setState("pending");
      if (creating) return;
      creating = true;
      // Token novo antes de pedir: garante que o "e-mail confirmado" já está nele.
      user
        .getIdToken(true)
        .then(() => setDoc(doc(db, "accessRequests", user.uid), { email: user.email ?? "", name: displayNameFor(user), status: "pending", createdAt: serverTimestamp() }))
        .catch((error) => {
          console.warn("accessRequests:", error);
          setState("error");
        });
    };

    const onError = (error: unknown) => {
      console.warn("access:", error);
      setState("error");
    };
    const stopAdmin = onSnapshot(
      doc(db, "admins", user.uid),
      (snap) => {
        adminAnswered = true;
        adminExists = snap.exists();
        decide();
      },
      onError
    );
    const stopRequest = onSnapshot(
      doc(db, "accessRequests", user.uid),
      (snap) => {
        request = snap.exists() ? (snap.data().status === "rejected" ? "rejected" : "pending") : null;
        decide();
      },
      onError
    );
    return () => {
      stopAdmin();
      stopRequest();
    };
  }, [user, isSuper, verified, tick]);

  return { state, refresh };
}

/** Reenvia o e-mail de confirmação (o Firebase limita o número de envios seguidos). */
export const resendVerification = (user: User) => sendEmailVerification(user);

// --- só o responsável usa o que está daqui pra baixo ---

export function useAccessLists(enabled: boolean): { requests: AccessRequest[]; admins: AdminAccount[]; error: boolean } {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const fail = (e: unknown) => {
      console.warn("access lists:", e);
      setError(true);
    };
    const stopRequests = onSnapshot(
      query(requestsRef(), orderBy("createdAt", "desc")),
      (snap) =>
        setRequests(
          snap.docs.map((d) => ({
            id: d.id,
            email: String(d.data().email ?? ""),
            name: String(d.data().name ?? ""),
            status: d.data().status === "rejected" ? "rejected" : "pending",
            createdAt: millis(d.data().createdAt),
          }))
        ),
      fail
    );
    const stopAdmins = onSnapshot(
      adminsRef(),
      (snap) =>
        setAdmins(
          snap.docs.map((d) => ({ id: d.id, email: String(d.data().email ?? ""), name: String(d.data().name ?? ""), approvedAt: millis(d.data().approvedAt) }))
        ),
      fail
    );
    return () => {
      stopRequests();
      stopAdmins();
    };
  }, [enabled]);

  return { requests, admins, error };
}

/** Libera o acesso: cria a conta autorizada e tira o pedido da fila, tudo de uma vez. */
export async function approveAccess(request: AccessRequest) {
  const db = getDb();
  const batch = writeBatch(db);
  batch.set(doc(db, "admins", request.id), { email: request.email, name: request.name, approvedAt: serverTimestamp() });
  batch.delete(doc(db, "accessRequests", request.id));
  await batch.commit();
}

/** Nega o pedido. Fica registrado como negado, pra a pessoa não pedir de novo sozinha. */
export const rejectAccess = (request: AccessRequest) => setDoc(doc(getDb(), "accessRequests", request.id), { email: request.email, name: request.name, status: "rejected", createdAt: serverTimestamp() });

/** Tira o acesso de quem já tinha (ex.: perdeu o celular). Também fica registrado como negado. */
export async function revokeAccess(account: AdminAccount) {
  const db = getDb();
  const batch = writeBatch(db);
  batch.delete(doc(db, "admins", account.id));
  batch.set(doc(db, "accessRequests", account.id), { email: account.email, name: account.name, status: "rejected", createdAt: serverTimestamp() });
  await batch.commit();
}
