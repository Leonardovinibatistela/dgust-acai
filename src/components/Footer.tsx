"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import { Logo } from "./Navbar";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const columns = [
  {
    title: "Cardápio",
    links: [
      { label: "Açaís da casa", href: "#cardapio" },
      { label: "Cardápio completo", href: "#cardapio-completo" },
    ],
  },
  {
    title: "A Dgust",
    links: [
      { label: "Por que Dgust", href: "#porque" },
      { label: "Dúvidas frequentes", href: "#faq" },
    ],
  },
];

const payments = ["PIX", "Visa", "Mastercard", "Elo", "Dinheiro"];

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
            <div className="flex gap-2.5">
              {[
                { icon: InstagramIcon, label: "Instagram do Dgust Açai" },
                { icon: FacebookIcon, label: "Facebook do Dgust Açai" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full glass text-cream-100/70 transition-all duration-300 hover:-translate-y-1 hover:border-acai-400/40 hover:text-cream-50"
                >
                  <s.icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
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
            © {new Date().getFullYear()} Dgust Açai. Desenvolvido com carinho para os amantes de
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
