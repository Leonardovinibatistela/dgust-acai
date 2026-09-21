"use client";

import { useEffect, useRef, useState } from "react";
import type { OrderRecord } from "./adminData";
import { connectPrinter, printOrder, type PrinterConnection } from "./printer";
import { playNewOrderChime } from "./notificationSound";

const readFlag = (key: string, fallback: boolean) => {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : saved === "1";
  } catch {
    return fallback;
  }
};
const writeValue = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* localStorage indisponível: segue sem salvar */
  }
};

/**
 * Som de pedido novo + impressora térmica (Bluetooth). Vive no Dashboard (não
 * na aba) pra o sininho continuar tocando mesmo com a aba Cardápio aberta.
 * Na primeira carga só marca os pedidos que já existiam como "vistos" — só o
 * que chegar DEPOIS toca o sino e (se ligado) imprime sozinho.
 */
export function useOrderAlerts(orders: OrderRecord[] | null, onError: (message: string) => void) {
  const [printerConn, setPrinterConn] = useState<PrinterConnection | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [autoPrint, setAutoPrint] = useState(() => readFlag("dgust_auto_print", false));
  const [soundEnabled, setSoundEnabled] = useState(() => readFlag("dgust_sound_enabled", true));
  const [soundVolume, setSoundVolume] = useState(() => {
    try {
      const saved = localStorage.getItem("dgust_sound_volume");
      return saved !== null ? Number(saved) : 70;
    } catch {
      return 70;
    }
  });
  const seenIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!orders) return;
    if (seenIds.current === null) {
      seenIds.current = new Set(orders.map((order) => order.id));
      return;
    }
    const seen = seenIds.current;
    const fresh = orders.filter((order) => !seen.has(order.id));
    if (fresh.length === 0) return;
    fresh.forEach((order) => seen.add(order.id));
    if (soundEnabled) playNewOrderChime(soundVolume / 100);
    if (!autoPrint || !printerConn) return;
    fresh.forEach((order) => {
      printOrder(printerConn.characteristic, order).catch((error) =>
        onError(`Não consegui imprimir o Pedido #${order.orderNumber} automaticamente.\n\nDetalhe do erro: ${error?.message ?? error}`)
      );
    });
  }, [orders, autoPrint, printerConn, soundEnabled, soundVolume, onError]);

  const connect = () => {
    setConnecting(true);
    connectPrinter()
      .then((conn) => {
        setPrinterConn(conn);
        conn.device.addEventListener("gattserverdisconnected", () => setPrinterConn(null));
      })
      .catch((error) => onError(`Não foi possível conectar na impressora.\n\nDetalhe do erro: ${error?.message ?? error}`))
      .finally(() => setConnecting(false));
  };

  const print = (order: OrderRecord) => {
    if (!printerConn) {
      onError('Conecte a impressora primeiro (botão "Conectar impressora").');
      return;
    }
    setPrintingId(order.id);
    printOrder(printerConn.characteristic, order)
      .catch((error) => onError(`Não foi possível imprimir o Pedido #${order.orderNumber}.\n\nDetalhe do erro: ${error?.message ?? error}`))
      .finally(() => setPrintingId(null));
  };

  const toggleAutoPrint = () =>
    setAutoPrint((current) => {
      writeValue("dgust_auto_print", current ? "0" : "1");
      return !current;
    });
  const toggleSound = () =>
    setSoundEnabled((current) => {
      writeValue("dgust_sound_enabled", current ? "0" : "1");
      return !current;
    });
  const changeVolume = (value: number) => {
    setSoundVolume(value);
    writeValue("dgust_sound_volume", String(value));
  };
  const testSound = () => {
    if (soundEnabled) playNewOrderChime(soundVolume / 100);
  };

  return { printerConn, connecting, printingId, autoPrint, soundEnabled, soundVolume, connect, print, toggleAutoPrint, toggleSound, changeVolume, testSound };
}

export type OrderAlerts = ReturnType<typeof useOrderAlerts>;
