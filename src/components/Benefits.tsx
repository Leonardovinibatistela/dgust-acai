"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin, PackageCheck, Smartphone, Trophy } from "lucide-react";
import { Reveal, SectionHeading, StaggerGroup, StaggerItem } from "./Reveal";

const benefits = [
  {
    icon: Smartphone,
    title: "Peça em 3 toques",
    text: "App ou WhatsApp, sem cadastro chato. Seu histórico de bowls fica salvo para repetir o pedido em segundos.",
  },
  {
    icon: MapPin,
    title: "Acompanhe em tempo real",
    text: "Do preparo à entrega, você vê cada etapa — e sabe exatamente quando ouvir a campainha.",
  },
  {
    icon: PackageCheck,
    title: "Chega impecável",
    text: "Embalagem térmica premium que mantém a textura cremosa e os toppings intactos até a sua porta.",
  },
];

export default function Benefits() {
  const reduce = useReducedMotion();

  return (
    <section id="beneficios" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute right-[-12%] top-[8%] h-[520px] w-[520px] rounded-full bg-indigo-600/15 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        {/* visual */}
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative">
            <div
              className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-acai-600/25 via-transparent to-fuchsia-600/20 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 shadow-2xl shadow-black/50">
              <img
                src="/images/lifestyle.jpg"
                alt="Cliente sorrindo com um bowl de açaí Dgust em mãos"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/5]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night-1000/70 via-transparent to-night-1000/20" />
            </div>

            {/* floating stat card */}
            <motion.div
              animate={reduce ? {} : { y: [0, -12, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="glass-strong absolute -right-3 top-8 rounded-3xl p-5 shadow-2xl shadow-black/40 sm:-right-6"
            >
              <span className="font-display block text-4xl font-semibold text-gradient">98%</span>
              <span className="mt-1 block max-w-[130px] text-xs leading-snug text-cream-100/65">
                dos clientes voltam a pedir em até 30 dias
              </span>
            </motion.div>

            {/* floating rating chip */}
            <motion.div
              animate={reduce ? {} : { y: [0, 10, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="glass-strong absolute -left-3 bottom-10 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl shadow-black/40 sm:-left-8"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-mango-400 to-orange-500 text-white">
                <Trophy className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold leading-tight text-cream-100">
                Top 1 em satisfação
                <span className="block text-[10px] font-normal text-cream-100/55">
                  entre açaís da região
                </span>
              </span>
            </motion.div>
          </div>
        </Reveal>

        {/* copy */}
        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="A experiência Dgust"
            title={
              <>
                Sobremesa perfeita, do primeiro clique à{" "}
                <span className="text-gradient italic">última colherada</span>
              </>
            }
            description="Cuidamos de cada detalhe para que pedir açaí seja tão prazeroso quanto comê-lo."
          />

          <StaggerGroup className="mt-10 flex flex-col gap-4">
            {benefits.map((b) => (
              <StaggerItem key={b.title}>
                <div className="group flex items-start gap-4 rounded-2xl border border-transparent p-4 transition-all duration-500 hover:border-white/8 hover:bg-white/[0.035]">
                  <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-acai-500/80 to-fuchsia-600/80 text-white shadow-lg shadow-acai-600/25 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    <b.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-cream-50">{b.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-cream-100/55">{b.text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal delay={0.15} className="mt-8 pl-4">
            <a
              href="#combos"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-acai-300 transition-colors hover:text-cream-50"
            >
              Quero experimentar
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
