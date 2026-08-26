import type { ReactNode } from "react";

// Still used by a few components (Hero, FAQ) for their own small, self-contained
// framer-motion animations that aren't gated behind hydration for visibility.
export const EASE: [number, number, number, number] = [0.21, 0.65, 0.35, 1];

// Note: these use a pure-CSS animation (see .reveal-in in globals.css), not
// framer-motion. framer-motion's initial={{opacity:0}} -> animate() pattern
// renders content invisible in the server HTML and only makes it visible once
// React hydrates on the client — on a slow phone or weak connection that can
// take several seconds, during which real users saw a blank/purple page. CSS
// animations start as soon as the stylesheet is parsed, independent of JS/
// hydration timing, so content always becomes visible reliably.

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  /** kept for call-site compatibility; the CSS animation always travels the same distance */
  y?: number;
  className?: string;
}) {
  return (
    <div className={`reveal-in ${className ?? ""}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  /** @deprecated no longer used */
  amount?: number;
}) {
  return <div className={className}>{children}</div>;
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
  return (
    <div className={`reveal-in ${className ?? ""}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
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
