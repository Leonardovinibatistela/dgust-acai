// Endereço público do site. Quando o domínio .com.br entrar, defina NEXT_PUBLIC_SITE_URL
// na Vercel (ex.: https://dgustacai.com.br) e o sitemap, o robots e o Google passam a usar ele.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dgust-acai.vercel.app").replace(/\/+$/, "");
