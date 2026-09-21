"use client";

import { useEffect, useMemo, useState } from "react";
import { EyeOff, Pencil, RotateCcw, Search } from "lucide-react";
import { getProducts } from "../app/actions";
import {
  clearItemDescription,
  clearItemName,
  clearItemPrice,
  itemId,
  setItemDescription,
  setItemHidden,
  setItemName,
  setItemPrice,
  setItemSoldOut,
  type MenuStatus,
} from "../lib/menuStatus";
import { brl, btn, btnDanger, btnOn, btnPrimary, card, eyebrow, input } from "./ui";
import type { ConfirmFn } from "./useConfirm";
import PhotoDialog from "./PhotoDialog";

type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  sizes: string; // JSON: { label, price }[]
};

const CATEGORY_ORDER = ["premium", "tradicional", "garrafa", "barca_marmita", "sobremesa"];
const CATEGORY_LABELS: Record<string, string> = {
  premium: "Açaí Premium",
  tradicional: "Monte seu Açaí",
  garrafa: "Na Garrafa",
  barca_marmita: "Barcas e Marmitas",
  sobremesa: "Sobremesas",
};

const errorText = (error: unknown) => {
  const e = error as { code?: string; message?: string } | undefined;
  return `${e?.code ? `[${e.code}] ` : ""}${e?.message ?? String(error)}`;
};

export default function MenuPanel({ status, onError, confirm }: { status: MenuStatus; onError: (message: string) => void; confirm: ConfirmFn }) {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");

  const [photoProductId, setPhotoProductId] = useState<string | null>(null);
  const photoProduct = photoProductId ? (products ?? []).find((p) => p.id === photoProductId) ?? null : null;

  useEffect(() => {
    getProducts("todos").then((res) => {
      if (res.success && res.products) setProducts(res.products as CatalogProduct[]);
      else setLoadFailed(true);
    });
  }, []);

  const grouped = useMemo(() => {
    const term = search.trim().toLowerCase();
    const visible = (products ?? []).filter((p) => !term || (status.names[p.id] ?? p.name).toLowerCase().includes(term));
    const byCategory = new Map<string, CatalogProduct[]>();
    visible.forEach((p) => byCategory.set(p.category, [...(byCategory.get(p.category) ?? []), p]));
    const known = CATEGORY_ORDER.filter((c) => byCategory.has(c));
    const extra = [...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c));
    return [...known, ...extra].map((category) => ({ category, items: byCategory.get(category) ?? [] }));
  }, [products, search, status.names]);

  // Resolve true se salvou, false se falhou (o erro já foi mostrado na tela).
  const run = (id: string, task: Promise<unknown>, failure: string): Promise<boolean> => {
    setBusyId(id);
    return task
      .then(
        () => true,
        (error) => {
          onError(`${failure}\n\nDetalhe do erro: ${errorText(error)}`);
          return false;
        }
      )
      .finally(() => setBusyId(null));
  };

  const startEditProduct = (p: CatalogProduct) => {
    setEditingProductId(p.id);
    setNameDraft(status.names[p.id] ?? p.name);
    setDescriptionDraft(status.descriptions[p.id] ?? p.description);
  };

  const saveProduct = (p: CatalogProduct) => {
    const name = nameDraft.trim();
    if (!name) {
      onError("Digite um nome válido.");
      return;
    }
    const description = descriptionDraft.trim();
    run(
      p.id,
      Promise.all([
        name === p.name ? clearItemName(p.id) : setItemName(p.id, name),
        description === p.description ? clearItemDescription(p.id) : setItemDescription(p.id, description),
      ]),
      "Não foi possível salvar as alterações."
    ).then((saved) => saved && setEditingProductId(null));
  };

  const resetProduct = (p: CatalogProduct) => run(p.id, Promise.all([clearItemName(p.id), clearItemDescription(p.id)]), "Não foi possível restaurar o padrão.");

  const toggleHidden = async (p: CatalogProduct, currentName: string, hidden: boolean) => {
    if (!hidden && !(await confirm(`Tirar "${currentName}" do site? Ele some do cardápio para os clientes, mas fica guardado aqui e dá pra restaurar quando quiser.`, { confirmLabel: "Tirar do site", danger: true }))) return;
    run(p.id, setItemHidden(p.id, !hidden), "Não foi possível atualizar esse item.");
  };

  const toggleSoldOutAll = (p: CatalogProduct, ids: string[], soldOut: boolean) => run(p.id, Promise.all(ids.map((id) => setItemSoldOut(id, soldOut))), "Não foi possível atualizar todos os tamanhos.");

  const startEditPrice = (id: string, current: number) => {
    setEditingPriceId(id);
    setPriceDraft(current.toFixed(2).replace(".", ","));
  };

  const savePrice = (id: string, defaultPrice: number) => {
    const parsed = Number(priceDraft.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 999) {
      onError("Digite um preço válido (ex.: 25,00).");
      return;
    }
    run(id, parsed === defaultPrice ? clearItemPrice(id) : setItemPrice(id, parsed), "Não foi possível salvar o preço.").then((saved) => saved && setEditingPriceId(null));
  };

  if (loadFailed) return <div className={`${card} mt-8 text-center text-sm text-cream-100/75`}>Não foi possível carregar o cardápio. Recarregue a página.</div>;
  if (!products) return <div className={`${card} mt-8 text-center text-sm text-cream-100/75`}>Carregando cardápio…</div>;

  return (
    <div className="mt-8 space-y-6">
      <div className={card}>
        <p className={eyebrow}>Cardápio</p>
        <h2 className="font-display mt-1 text-2xl font-semibold text-cream-50">Preços e disponibilidade</h2>
        <p className="mt-2 text-sm leading-relaxed text-cream-100/75">
          Acabou um tamanho? Marque como esgotado e ele fica indisponível no site na hora. Preço mudou? Edite aqui. Não vende mais? &quot;Tirar do site&quot; esconde o item sem apagar nada.
        </p>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-100/50" aria-hidden="true" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar açaí pelo nome" aria-label="Buscar açaí pelo nome" className={`${input} pl-10`} />
        </div>
      </div>

      {grouped.length === 0 && <p className="text-center text-sm text-cream-100/70">Nenhum item encontrado.</p>}

      {grouped.map(({ category, items }) => (
        <section key={category} aria-label={CATEGORY_LABELS[category] ?? category}>
          <p className={eyebrow}>{CATEGORY_LABELS[category] ?? category}</p>
          <div className="mt-3 space-y-3">
            {items.map((p) => {
              const sizes = JSON.parse(p.sizes) as { label: string; price: number }[];
              const ids = sizes.map((s) => itemId(p.id, s.label));
              const allSoldOut = ids.every((id) => status.soldOut.has(id) || status.soldOut.has(p.id));
              const hidden = status.hidden.has(p.id);
              const name = status.names[p.id] ?? p.name;
              const description = status.descriptions[p.id] ?? p.description;
              const edited = status.names[p.id] !== undefined || status.descriptions[p.id] !== undefined;
              const editing = editingProductId === p.id;
              const busy = busyId === p.id;

              return (
                <article key={p.id} className={`rounded-2xl border border-white/10 bg-night-900/80 p-4 sm:p-5 ${hidden ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setPhotoProductId(p.id)}
                      className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mango-400"
                      aria-label={`Ver e trocar a foto de ${name}`}
                    >
                      <img src={status.photos[p.id] ?? p.image} alt="" className="h-full w-full object-cover object-[center_30%]" />
                      <span className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center text-[10px] font-semibold text-white">Ver / trocar</span>
                    </button>
                    <div className="min-w-0 flex-1">
                      {editing ? (
                        <div className="space-y-2">
                          <label className="sr-only" htmlFor={`name-${p.id}`}>
                            Nome
                          </label>
                          <input id={`name-${p.id}`} type="text" autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="Nome" className={input} />
                          <label className="sr-only" htmlFor={`desc-${p.id}`}>
                            Descrição
                          </label>
                          <textarea id={`desc-${p.id}`} value={descriptionDraft} onChange={(e) => setDescriptionDraft(e.target.value)} placeholder="Descrição" rows={3} className={`${input} resize-none`} />
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => saveProduct(p)} disabled={busy} className={btnPrimary}>
                              {busy ? "Salvando…" : "Salvar"}
                            </button>
                            <button type="button" onClick={() => setEditingProductId(null)} className={btn}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`text-base font-semibold ${allSoldOut ? "text-cream-100/60 line-through" : "text-cream-50"}`}>{name}</h3>
                            {hidden && <span className="rounded-full bg-red-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-300">Fora do site</span>}
                            {edited && <span className="rounded-full bg-acai-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-acai-200">Editado</span>}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-cream-100/65">{description}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button type="button" onClick={() => startEditProduct(p)} className={btn}>
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              Editar nome e descrição
                            </button>
                            {edited && (
                              <button type="button" onClick={() => resetProduct(p)} disabled={busy} className={btn}>
                                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                                Restaurar padrão
                              </button>
                            )}
                            <button type="button" onClick={() => toggleSoldOutAll(p, ids, !allSoldOut)} disabled={busy} className={allSoldOut ? btnOn : btn} aria-pressed={allSoldOut}>
                              {allSoldOut ? "Reativar todos os tamanhos" : "Esgotar todos os tamanhos"}
                            </button>
                            <button type="button" onClick={() => toggleHidden(p, name, hidden)} disabled={busy} className={hidden ? btn : btnDanger}>
                              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                              {hidden ? "Restaurar no site" : "Tirar do site"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10">
                    {sizes.map((size) => {
                      const id = itemId(p.id, size.label);
                      const current = status.prices[id] ?? size.price;
                      const soldOut = status.soldOut.has(id) || status.soldOut.has(p.id);
                      const changed = status.prices[id] !== undefined;
                      const editingThis = editingPriceId === id;
                      const busyThis = busyId === id;
                      return (
                        <li key={id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={`text-sm font-semibold ${soldOut ? "text-cream-100/60 line-through" : "text-cream-50"}`}>{size.label}</span>
                            {editingThis ? (
                              <span className="flex items-center gap-2">
                                <span className="text-sm text-cream-100/75">R$</span>
                                <label className="sr-only" htmlFor={`price-${id}`}>
                                  Preço de {size.label}
                                </label>
                                <input
                                  id={`price-${id}`}
                                  type="text"
                                  inputMode="decimal"
                                  autoFocus
                                  value={priceDraft}
                                  onChange={(e) => setPriceDraft(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && savePrice(id, size.price)}
                                  className={`${input} !w-24 !py-1.5`}
                                />
                                <button type="button" onClick={() => savePrice(id, size.price)} disabled={busyThis} className={btnPrimary}>
                                  {busyThis ? "…" : "Salvar"}
                                </button>
                                <button type="button" onClick={() => setEditingPriceId(null)} className={btn}>
                                  Cancelar
                                </button>
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <span className="text-sm text-cream-100/85">{brl(current)}</span>
                                {changed && <span className="rounded-full bg-acai-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-acai-200">Alterado</span>}
                                <button type="button" onClick={() => startEditPrice(id, current)} className={btn}>
                                  Editar preço
                                </button>
                                {changed && (
                                  <button type="button" onClick={() => run(id, clearItemPrice(id), "Não foi possível restaurar o preço.")} disabled={busyThis} className={btn}>
                                    Voltar a {brl(size.price)}
                                  </button>
                                )}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => run(id, setItemSoldOut(id, !status.soldOut.has(id)), "Não foi possível atualizar esse tamanho.")}
                            disabled={busyThis || status.soldOut.has(p.id)}
                            aria-pressed={soldOut}
                            className={soldOut ? btnOn : btn}
                          >
                            {busyThis ? "…" : soldOut ? "Esgotado (reativar)" : "Marcar esgotado"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {photoProduct && (
        <PhotoDialog
          productId={photoProduct.id}
          productName={status.names[photoProduct.id] ?? photoProduct.name}
          currentImage={status.photos[photoProduct.id] ?? photoProduct.image}
          isCustom={status.photos[photoProduct.id] !== undefined}
          onClose={() => setPhotoProductId(null)}
          onError={onError}
        />
      )}
    </div>
  );
}
