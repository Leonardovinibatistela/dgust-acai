"use client";

import { Flame, Plus, Star } from "lucide-react";
import { SectionHeading, StaggerGroup, StaggerItem } from "./Reveal";

interface ShowcaseProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  sizes: string; // JSON string of { label, price }[]
  freeToppingsLimit: number;
  rating: string;
  reviewsCount: number;
  isFeatured: boolean;
}

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ProductCard({
  product,
  index,
  categoryLabel,
  onAdd,
}: {
  product: ShowcaseProduct;
  index: number;
  categoryLabel: string;
  onAdd: () => void;
}) {
  const sizes = JSON.parse(product.sizes) as { label: string; price: number }[];
  const basePrice = sizes.length > 0 ? sizes[0].price : 0;

  return (
    <StaggerItem delay={index * 0.05}>
      <article className="card-hover group glass relative flex h-full flex-col overflow-hidden rounded-[1.75rem]">
        {/* image */}
        <div className="relative aspect-[5/4] overflow-hidden">
          <img
            src={product.image}
            alt={`${product.name} — ${product.description}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.21,0.65,0.35,1)] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-1000/85 via-night-1000/10 to-transparent" />
          {product.isFeatured && (
            <span className="glass-strong absolute left-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cream-50">
              <Flame className="h-3 w-3 text-mango-400" />
              Mais vendido
            </span>
          )}
          <span className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[11px] font-bold text-cream-100/90 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-mango-400 text-mango-400" />
            {product.rating} ({product.reviewsCount})
          </span>
        </div>

        {/* content */}
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-tight text-cream-50">
              {product.name}
            </h3>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-acai-300">
              {categoryLabel}
            </p>
          </div>

          <p className="line-clamp-3 text-sm leading-relaxed text-cream-100/55">
            {product.description}
          </p>

          {sizes.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((sz) => (
                <span
                  key={sz.label}
                  className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-cream-100/65"
                >
                  {sz.label} · {brl(sz.price)}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/8 pt-5">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wider text-cream-100/40">
                a partir de
              </span>
              <span className="font-display text-2xl font-semibold text-cream-50">
                {brl(basePrice)}
              </span>
            </div>
            <button
              onClick={onAdd}
              className="btn-primary relative flex h-12 min-w-[132px] items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-semibold text-white transition-colors duration-300"
              aria-label={`Montar ${product.name}`}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>
        </div>
      </article>
    </StaggerItem>
  );
}

export default function ProductShowcase({
  products,
  categoryLabels,
  onAdd,
}: {
  products: ShowcaseProduct[];
  categoryLabels: Record<string, string>;
  onAdd: (product: ShowcaseProduct) => void;
}) {
  return (
    <section id="cardapio" className="relative py-24 sm:py-32">
      {/* ambient */}
      <div
        className="pointer-events-none absolute left-[-10%] top-[30%] h-[480px] w-[480px] rounded-full bg-acai-600/15 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[-8%] top-[55%] h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Cardápio"
          title={
            <>
              Escolha seu <span className="text-gradient italic">vício</span> favorito
            </>
          }
          description="As assinaturas mais pedidas da casa. Monte com o tamanho e os toppings que quiser na hora de adicionar."
        />

        {products.length === 0 ? (
          <p className="mt-16 text-center text-sm text-cream-100/50">
            Carregando o cardápio...
          </p>
        ) : (
          <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4" amount={0.12}>
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                categoryLabel={categoryLabels[p.category] ?? p.category}
                onAdd={() => onAdd(p)}
              />
            ))}
          </StaggerGroup>
        )}

        <p className="mt-10 text-center text-sm text-cream-100/40">
          Quer ver o cardápio completo com todas as categorias?{" "}
          <a href="#cardapio-completo" className="font-semibold text-acai-300 hover:text-cream-50">
            Clique aqui
          </a>
        </p>
      </div>
    </section>
  );
}
