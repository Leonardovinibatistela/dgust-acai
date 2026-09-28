"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import { Logo } from "./Navbar";

const columns = [
  {
    title: "Cardápio",
    links: [
      { label: "Açaís da casa", href: "#cardapio" },
      { label: "Cardápio completo", href: "#cardapio-completo" },
    ],
  },
  {
    title: "A D'Gust",
    links: [
      { label: "Por que D'Gust", href: "#porque" },
      { label: "Dúvidas frequentes", href: "#faq" },
    ],
  },
];

const payments = ["Pix", "Cartão", "Dinheiro"];

export default function Footer({
  phone,
  address,
  hours,
}: {
  phone: string;
  address: string;
  hours: string;
}) {
  return (
    <footer className="relative border-t border-white/8 bg-night-1000">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(72rem,90%)] -translate-x-1/2 bg-gradient-to-r from-transparent via-acai-500/40 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.1fr]">
          {/* brand */}
          <div className="flex flex-col items-start gap-5">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-cream-100/50">
              Açaí artesanal, feito na hora e entregue geladinho. A sobremesa que virou paixão por
              aqui.
            </p>
          </div>

          {/* link columns */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-cream-100/40">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-cream-100/60 transition-colors duration-300 hover:text-cream-50"
                    >
                      <span className="h-px w-0 bg-gradient-to-r from-acai-400 to-fuchsia-400 transition-all duration-300 group-hover:w-4" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* contact */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-cream-100/40">
              Contato
            </h3>
            <ul className="flex flex-col gap-4 text-sm text-cream-100/60">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-acai-300" />
                <span>{address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-acai-300" />
                <span>
                  {phone}
                  <span className="block text-cream-100/40">WhatsApp para pedidos</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-acai-300" />
                <span>{hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-white/8 pt-8 sm:flex-row">
          <p className="text-xs text-cream-100/40">
            © {new Date().getFullYear()} D&apos;Gust Açaí. Desenvolvido com carinho para os amantes de
            açaí.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {payments.map((p) => (
              <span
                key={p}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream-100/50"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
