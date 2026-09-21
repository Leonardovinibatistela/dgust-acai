import Acaistore from "@/components/Acaistore";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// Dados da loja pro Google (aparecem no mapa e na busca local). Só informação real:
// endereço, telefone e horário do D'Gust. Se algum mudar, atualize aqui também.
const localBusiness = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "D'Gust Açaí",
  url: SITE_URL,
  image: `${SITE_URL}/images/dgust-logo.jpg`,
  telephone: "+5566996605529",
  servesCuisine: "Açaí",
  hasMenu: `${SITE_URL}/#cardapio-completo`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua 2",
    addressLocality: "Matupá",
    addressRegion: "MT",
    postalCode: "78525-000",
    addressCountry: "BR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "13:30",
      closes: "22:00",
    },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "13:30", closes: "18:30" },
  ],
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        // JSON fixo do próprio código (sem entrada de usuário); o "<" é escapado por segurança.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g, "\\u003c") }}
      />
      <Acaistore />
    </main>
  );
}
