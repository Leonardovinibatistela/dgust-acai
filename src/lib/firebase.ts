import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// A config do Firebase é pública por design (não é senha): quem protege os
// dados de verdade são as Regras de Segurança do Firestore (firestore.rules).
// Cada NEXT_PUBLIC_* precisa ser lido por nome literal (process.env.X) pra o
// Next.js conseguir embutir o valor no build.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Falso enquanto as variáveis NEXT_PUBLIC_FIREBASE_* não estiverem configuradas — o site segue funcionando sem o painel. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

// Inicialização preguiçosa: este módulo também é importado por componentes
// que o Next.js renderiza no servidor, e nada de Firebase deve rodar no
// import (só quando alguém realmente usa).
export const getDb = (): Firestore => getFirestore(getFirebaseApp());
export const getAuthClient = (): Auth => getAuth(getFirebaseApp());
