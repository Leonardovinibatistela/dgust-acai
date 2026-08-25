"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, ShoppingBag, Sparkles, X } from "lucide-react";

const links = [
  { label: "Início", href: "#inicio" },
  { label: "Cardápio", href: "#cardapio" },
  { label: "Combos", href: "#combos" },
  { label: "Avaliações", href: "#avaliacoes" },
  { label: "FAQ", href: "#faq" },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#inicio" className="group flex items-center gap-2.5" aria-label="Dgust Açai — início">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-acai-500 via-acai-600 to-fuchsia-600 shadow-lg shadow-acai-600/40 transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105">
        <span className="font-display text-lg font-bold text-white">D</span>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-mango-400 ring-2 ring-night-1000" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl font-semibold tracking-tight text-cream-50">
            Dgust
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-acai-300">
            Açai
          </span>
        </span>
      )}
    </a>
  );
}

export default function Navbar({
  cartCount,
  onCartClick,
}: {
  cartCount: number;
  onCartClick: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.21, 0.65, 0.35, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "glass-strong shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="group relative rounded-full px-4 py-2 text-sm font-medium text-cream-100/70 transition-colors duration-300 hover:text-cream-50"
                >
                  {link.label}
                  <span className="absolute inset-x-4 -bottom-px h-px origin-left scale-x-0 bg-gradient-to-r from-acai-400 to-fuchsia-400 transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCartClick}
              className="relative flex h-11 w-11 items-center justify-center rounded-full glass text-cream-100 transition-all duration-300 hover:border-acai-400/40 hover:text-white"
              aria-label={`Ver meu pedido, ${cartCount} itens`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-acai-500 to-fuchsia-500 px-1 text-[11px] font-bold text-white shadow-lg shadow-acai-500/50"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <a
              href="#cardapio"
              className="btn-primary hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white sm:inline-flex"
            >
              <Sparkles className="h-4 w-4" />
              Pedir agora
            </a>

            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full glass text-cream-100 lg:hidden"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* scroll progress */}
        <motion.div
          style={{ scaleX: progress }}
          className="h-[2px] origin-left bg-gradient-to-r from-acai-500 via-fuchsia-400 to-mango-400"
        />
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass-strong mx-4 mt-2 overflow-hidden rounded-3xl p-4 shadow-2xl lg:hidden"
          >
            <ul className="flex flex-col">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium text-cream-100/80 transition-colors hover:bg-white/5 hover:text-cream-50"
                  >
                    {link.label}
                    <span className="text-acai-400">→</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href="#cardapio"
              onClick={() => setOpen(false)}
              className="btn-primary mt-3 flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-white"
            >
              <Sparkles className="h-4 w-4" />
              Pedir agora
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
