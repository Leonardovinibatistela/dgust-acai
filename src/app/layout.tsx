import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SITE_URL } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "D'Gust Açaí em Matupá - MT | Peça seu açaí online",
  description: "Peça açaí online na D'Gust Açaí, em Matupá - MT. Monte seu açaí com acompanhamentos grátis, confira os copos premium, barcas e sobremesas e faça o pedido pelo WhatsApp.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "D'Gust Açaí",
    title: "D'Gust Açaí em Matupá - MT | Peça seu açaí online",
    description: "Monte seu açaí do seu jeito e faça o pedido pelo WhatsApp.",
    images: [{ url: "/images/dgust-logo.jpg", alt: "D'Gust Açaí" }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
