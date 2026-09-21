"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, RotateCcw, X } from "lucide-react";
import { clearProductPhoto, setProductPhoto } from "../lib/menuStatus";
import { fileToJpegDataUrl } from "./resizeImage";
import { btn, btnPrimary, card, eyebrow } from "./ui";

/** Foto do produto em tamanho grande, com troca e volta pra foto original. */
export default function PhotoDialog({
  productId,
  productName,
  currentImage,
  isCustom,
  onClose,
  onError,
}: {
  productId: string;
  productName: string;
  currentImage: string;
  /** true quando a foto atual foi trocada pelo painel (existe uma original pra voltar) */
  isCustom: boolean;
  onClose: () => void;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handlePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      await setProductPhoto(productId, await fileToJpegDataUrl(file));
    } catch (error) {
      const e = error as { code?: string; message?: string };
      onError(`Não foi possível trocar a foto.\n\nDetalhe: ${e.code ? `[${e.code}] ` : ""}${e.message ?? String(error)}`);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      await clearProductPhoto(productId);
    } catch (error) {
      onError(`Não foi possível voltar à foto original.\n\nDetalhe: ${(error as Error).message ?? String(error)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/80 px-4 py-6" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Foto de ${productName}`} className={`${card} w-full max-w-lg`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={eyebrow}>Foto do produto</p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-cream-50">{productName}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className={btn} aria-label="Fechar">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-night-950">
          <img src={currentImage} alt={productName} className="max-h-[55vh] w-full object-contain" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <label className={`${btnPrimary} cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            {busy ? "Enviando…" : "Trocar foto"}
            <input type="file" accept="image/*" onChange={handlePick} disabled={busy} className="sr-only" />
          </label>
          {isCustom && (
            <button type="button" onClick={handleRestore} disabled={busy} className={btn}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Voltar à foto original
            </button>
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-cream-100/65">A foto nova aparece no site na hora. Prefira foto na horizontal ou quadrada, com boa luz. Ela é reduzida automaticamente.</p>
      </div>
    </div>
  );
}
