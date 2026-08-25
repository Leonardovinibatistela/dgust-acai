import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "D'Gust Açaí | O Verdadeiro Açaí Premium",
  description: "Loja Virtual Oficial da D'Gust Açaí. Monte seu açaí tradicional com adicionais grátis, confira nossos copos premium, barcas e sobremesas irresistíveis!",
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
