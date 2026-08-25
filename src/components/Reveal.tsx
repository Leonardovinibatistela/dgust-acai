"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export const EASE: [number, number, number, number] = [0.21, 0.65, 0.35, 1];

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
};

export function Reveal({ children, delay = 0, y = 32, className, once = true }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-70px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay },
  }),
};

export function StaggerGroup({
  children,
  className,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerChild} custom={delay}>
      {children}
    </motion.div>
  );
}

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  id,
}: SectionHeadingProps) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-5 ${alignCls}`}>
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-acai-300">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-acai-400 to-fuchsia-400" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          id={id}
          className="font-display max-w-3xl text-4xl font-medium leading-[1.08] tracking-tight text-cream-50 sm:text-5xl lg:text-6xl"
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.16}>
          <p className="max-w-xl text-base leading-relaxed text-cream-100/60 sm:text-lg">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
