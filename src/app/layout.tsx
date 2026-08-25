import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "D'Gust Açaí | O Verdadeiro Açaí Premium",
  description: "Loja Virtual Oficial da D'Gust Açaí. Monte seu açaí tradicional com adicionais grátis, confira nossos copos premium, barcas e sobremesas irresistíveis!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
