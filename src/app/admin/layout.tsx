import type { Metadata } from "next";

// O painel é só do dono: não entra no Google.
export const metadata: Metadata = {
  title: "Painel | Dgust Açaí",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
