"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { btn, btnDanger, btnPrimary, card } from "./ui";

type Pending = { message: string; confirmLabel: string; danger: boolean; resolve: (ok: boolean) => void };
type ConfirmOptions = { confirmLabel?: string; danger?: boolean };

/**
 * Confirmação dentro da própria página, no lugar do window.confirm: alguns
 * navegadores (e o navegador embutido de apps) bloqueiam essa janelinha e ela
 * responde "não" sozinha, então o botão parecia não fazer nada.
 * Uso: const { confirm, dialog } = useConfirm(); ... if (await confirm("...")) { ... } ... {dialog}
 */
export function useConfirm() {
  const [pending, setPending] = useState<Pending | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback(
    (message: string, options?: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ message, confirmLabel: options?.confirmLabel ?? "Confirmar", danger: options?.danger ?? false, resolve })),
    []
  );

  const answer = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
    },
    [pending]
  );

  useEffect(() => {
    if (!pending) return;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && answer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, answer]);

  const dialog = pending ? (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 px-5" onMouseDown={() => answer(false)}>
      <div role="alertdialog" aria-modal="true" aria-describedby="confirm-message" className={`${card} w-full max-w-sm`} onMouseDown={(event) => event.stopPropagation()}>
        <p id="confirm-message" className="text-base leading-relaxed text-cream-50">
          {pending.message}
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button ref={cancelRef} type="button" onClick={() => answer(false)} className={btn}>
            Cancelar
          </button>
          <button type="button" onClick={() => answer(true)} className={pending.danger ? btnDanger : btnPrimary}>
            {pending.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}

export type ConfirmFn = ReturnType<typeof useConfirm>["confirm"];
