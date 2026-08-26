"use client";

import { Leaf, SlidersHorizontal, Timer } from "lucide-react";
import { SectionHeading, StaggerGroup, StaggerItem } from "./Reveal";

const features = [
  {
    icon: Timer,
    title: "Entrega relâmpago",
    description:
      "Do nosso freezer à sua porta em até 30 minutos, com embalagem térmica que conserva o geladinho da primeira à última colherada.",
    accent: "from-violet-500 to-indigo-500",
  },
  {
    icon: Leaf,
    title: "100% natural",
    description:
      "Polpa de açaí premium sem conservantes, sem corantes e sem aromatizantes. Fruta de verdade, colhida no auge do ponto.",
    accent: "from-emerald-400 to-teal-500",
  },
  {
    icon: SlidersHorizontal,
    title: "Monte do seu jeito",
    description:
      "Escolha o tamanho, a base e até 5 toppings entre frutas, crocantes e cremes. Cada açaí sai montado na hora, do seu jeitinho.",
    accent: "from-fuchsia-500 to-pink-500",
  },
];

export default function Features() {
  return (
    <section id="porque" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(72rem,90%)] -translate-x-1/2 bg-gradient-to-r from-transparent via-acai-500/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Por que Dgust"
          title={
            <>
              Não é só açaí. É <span className="text-gradient italic">experiência</span> em cada
              detalhe.
            </>
          }
          description="Do primeiro clique à última colherada, cada etapa foi desenhada para a sua sobremesa chegar perfeita."
        />

        <StaggerGroup className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <StaggerItem key={f.title}>
              <article className="card-hover group glass relative h-full overflow-hidden rounded-3xl p-7">
                <span className="font-display absolute -right-2 -top-5 text-[88px] font-bold leading-none text-white/[0.045] transition-colors duration-500 group-hover:text-acai-500/10">
                  0{i + 1}
                </span>
                <span
                  className={`relative mb-6 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${f.accent} p-3.5 text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}
                >
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display relative mb-2.5 text-xl font-semibold text-cream-50">
                  {f.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-cream-100/55">{f.description}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
