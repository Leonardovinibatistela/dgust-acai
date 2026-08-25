"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Plus } from "lucide-react";
import { EASE, Reveal, SectionHeading } from "./Reveal";
import { faqs } from "../data/content";

function FaqItem({
  faq,
  open,
  onToggle,
}: {
  faq: (typeof faqs)[number];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`glass overflow-hidden rounded-2xl transition-colors duration-500 ${
        open ? "border-acai-400/30 bg-white/[0.06]" : ""
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-cream-50 sm:text-base">{faq.question}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            open ? "bg-gradient-to-br from-acai-500 to-fuchsia-500 text-white" : "bg-white/8 text-acai-300"
          }`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-sm leading-relaxed text-cream-100/60">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ({ whatsappUrl }: { whatsappUrl: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div
        className="pointer-events-none absolute right-[-10%] top-[20%] h-[440px] w-[440px] rounded-full bg-indigo-600/12 blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="flex flex-col items-start gap-8">
          <SectionHeading
            align="left"
            eyebrow="Dúvidas frequentes"
            title={
              <>
                Tudo que você precisa saber <span className="text-gradient italic">antes do primeiro bowl</span>
              </>
            }
            description="E se sobrou alguma dúvida, é só chamar a gente — respondemos rapidinho."
          />

          <Reveal delay={0.15}>
            <div className="glass flex items-center gap-4 rounded-3xl p-5 pr-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-cream-50">Ainda tem dúvida?</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-acai-300 underline-offset-4 transition-colors hover:text-cream-50 hover:underline"
                >
                  Chama no WhatsApp →
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col gap-3.5">
          {faqs.map((faq, i) => (
            <Reveal key={faq.question} delay={i * 0.05}>
              <FaqItem
                faq={faq}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
