import { db } from "./index";
import { products, reviews } from "./schema";
import { eq, sql } from "drizzle-orm";

export const PRODUCT_DATA = [
  {
    id: "acai-na-garrafa-500ml",
    name: "Açaí na Garrafa 500ML",
    description: "O delicioso e cremoso açaí D'Gust pronto para beber na garrafa de 500ml! Escolha até 3 adicionais grátis para misturar e deixar a sua garrafa ainda mais saborosa.",
    category: "garrafa",
    image: "https://images.pexels.com/photos/7656565/pexels-photo-7656565.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    sizes: JSON.stringify([{ label: "500ML", price: 25.00 }]),
    freeToppingsLimit: 3,
    rating: "4.9",
    reviewsCount: 14,
    isFeatured: true,
  },
  {
    id: "acai-tradicional",
    name: "Açaí Tradicional",
    description: "O clássico e amado açaí cremoso D'Gust. Monte do seu jeito com até 5 adicionais grátis inclusos! Perfeito para matar aquela vontade a qualquer hora do dia.",
    category: "tradicional",
    image: "https://images.pexels.com/photos/12273052/pexels-photo-12273052.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([
      { label: "300ML", price: 20.00 },
      { label: "500ML", price: 25.00 },
      { label: "700ML", price: 30.00 }
    ]),
    freeToppingsLimit: 5,
    rating: "4.8",
    reviewsCount: 32,
    isFeatured: true,
  },
  {
    id: "barca-p",
    name: "Barca de Açaí P",
    description: "A famosa barca de açaí na medida certa para compartilhar ou devorar sozinho! Acompanha até 5 adicionais grátis distribuídos com muito capricho.",
    category: "barca_marmita",
    image: "https://images.pexels.com/photos/8465241/pexels-photo-8465241.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([{ label: "Barca P", price: 38.00 }]),
    freeToppingsLimit: 5,
    rating: "4.9",
    reviewsCount: 18,
    isFeatured: false,
  },
  {
    id: "barca-g",
    name: "Barca de Açaí G",
    description: "A rainha das festas! Uma mega barca generosa, recheada de açaí premium com direito a até 7 adicionais grátis. Ideal para compartilhar com amigos e família.",
    category: "barca_marmita",
    image: "https://images.pexels.com/photos/12174224/pexels-photo-12174224.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([{ label: "Barca G", price: 58.00 }]),
    freeToppingsLimit: 7,
    rating: "5.0",
    reviewsCount: 25,
    isFeatured: true,
  },
  {
    id: "marmita-p",
    name: "Marmita de Açaí P",
    description: "Praticidade e sabor! Marmita com açaí ultra cremoso D'Gust e até 5 adicionais grátis. Perfeito para levar para viagem.",
    category: "barca_marmita",
    image: "https://images.pexels.com/photos/3035261/pexels-photo-3035261.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([{ label: "Marmita P", price: 27.00 }]),
    freeToppingsLimit: 5,
    rating: "4.7",
    reviewsCount: 11,
    isFeatured: false,
  },
  {
    id: "marmita-m",
    name: "Marmita de Açaí M",
    description: "A marmita média que satisfaz qualquer louco por açaí! Super bem servida, com direito a até 5 adicionais grátis para sua felicidade completa.",
    category: "barca_marmita",
    image: "https://images.pexels.com/photos/9102652/pexels-photo-9102652.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([{ label: "Marmita M", price: 43.00 }]),
    freeToppingsLimit: 5,
    rating: "4.8",
    reviewsCount: 15,
    isFeatured: false,
  },
  {
    id: "acai-brownie-supreme",
    name: "Açaí Brownie Supreme",
    description: "Açaí cremoso, creme de ninho artesanal, generosos pedaços de brownie e morangos frescos picados na hora. Uma combinação campeã!",
    category: "premium",
    image: "/images/acai-brownie-supreme.jpg",
    sizes: JSON.stringify([
      { label: "300ML", price: 27.00 },
      { label: "500ML", price: 37.00 },
      { label: "700ML", price: 45.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "4.9",
    reviewsCount: 42,
    isFeatured: true,
  },
  {
    id: "acai-belga-trufado",
    name: "Açaí Belga Trufado",
    description: "Açaí cremoso intercalado com creme de chocolate belga artesanal, pedaços de Brownie crocante e morangos frescos. Puro pecado gastronômico!",
    category: "premium",
    image: "/images/acai-belga-trufado.jpg",
    sizes: JSON.stringify([
      { label: "300ML", price: 29.00 },
      { label: "500ML", price: 39.00 },
      { label: "700ML", price: 47.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "4.9",
    reviewsCount: 29,
    isFeatured: true,
  },
  {
    id: "acai-ninho-nutella",
    name: "Açaí Ninho c/ Nutella",
    description: "O queridinho do cardápio: o delicioso açaí D'Gust com o cremoso creme de ninho da casa e muita Nutella genuína, equilibrado com o sabor cítrico dos morangos frescos.",
    category: "premium",
    image: "/images/acai-ninho-nutella.jpg",
    sizes: JSON.stringify([
      { label: "300ML", price: 32.00 },
      { label: "500ML", price: 40.00 },
      { label: "700ML", price: 48.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "5.0",
    reviewsCount: 56,
    isFeatured: true,
  },
  {
    id: "acai-2-amores",
    name: "Açaí 2 Amores",
    description: "Açaí cremoso com camadas generosas de creme branco e creme de chocolate belga, finamente finalizado com gotas de chocolate crocantes.",
    category: "premium",
    image: "/images/acai-2-amores.jpg",
    sizes: JSON.stringify([
      { label: "300ML", price: 26.00 },
      { label: "500ML", price: 34.00 },
      { label: "700ML", price: 42.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "4.8",
    reviewsCount: 19,
    isFeatured: false,
  },
  {
    id: "acai-oreo-trufado",
    name: "Açaí Oreo Trufado",
    description: "Açaí cremoso, creme de oreo de dar água na boca, Nutella irresistível e o toque final de uma bolacha Oreo inteira no topo.",
    category: "premium",
    image: "https://images.pexels.com/photos/3028139/pexels-photo-3028139.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    sizes: JSON.stringify([
      { label: "300ML", price: 32.00 },
      { label: "500ML", price: 40.00 },
      { label: "700ML", price: 48.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "4.9",
    reviewsCount: 31,
    isFeatured: false,
  },
  {
    id: "acai-delicia-tropical",
    name: "Açaí Delícia Tropical",
    description: "Açaí cremoso combinado com o creme de quatro leites com abacaxi e finalizado com abacaxi caramelizado artesanal, trazendo o equilíbrio supremo entre o doce e o cítrico.",
    category: "premium",
    image: "https://images.pexels.com/photos/12174224/pexels-photo-12174224.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([
      { label: "300ML", price: 26.00 },
      { label: "500ML", price: 32.00 },
      { label: "700ML", price: 40.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "4.7",
    reviewsCount: 17,
    isFeatured: false,
  },
  {
    id: "acai-banoff",
    name: "Açaí Banoff",
    description: "Uma obra de arte: açaí cremoso com camadas generosas de doce de leite, fatias de banana fresquinha, farofinha de bolacha crocante e mousse de doce de leite. Uma explosão!",
    category: "premium",
    image: "https://images.pexels.com/photos/9102652/pexels-photo-9102652.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([
      { label: "300ML", price: 27.00 },
      { label: "500ML", price: 34.00 },
      { label: "700ML", price: 40.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "4.8",
    reviewsCount: 22,
    isFeatured: false,
  },
  {
    id: "acai-beijinho",
    name: "Açaí Beijinho",
    description: "Açaí cremoso combinado com o clássico creme de beijinho de coco, coco ralado crocante, leite em pó e finalizado com um bombom de beijinho de verdade.",
    category: "premium",
    image: "https://images.pexels.com/photos/8465241/pexels-photo-8465241.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([
      { label: "300ML", price: 27.00 },
      { label: "500ML", price: 35.00 },
      { label: "700ML", price: 42.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "4.9",
    reviewsCount: 26,
    isFeatured: false,
  },
  {
    id: "acai-morango-supreme",
    name: "Açaí Morango Supreme",
    description: "Açaí cremoso com camadas generosas e exuberantes de creme de quatro leites e geleia artesanal de morango fresco. Doce na medida exata para o seu paladar.",
    category: "premium",
    image: "https://images.pexels.com/photos/12273052/pexels-photo-12273052.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([
      { label: "300ML", price: 27.00 },
      { label: "500ML", price: 34.00 },
      { label: "700ML", price: 42.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "4.9",
    reviewsCount: 38,
    isFeatured: true,
  },
  {
    id: "acai-ferrero-rocher",
    name: "Açaí Ferrero Rocher",
    description: "O açaí mais chique do pedaço! Açaí cremoso com delicioso creme tipo Ferrero, recheado com Nutella e finalizado com mais do nosso creme especial e um autêntico bombom Ferrero Rocher.",
    category: "premium",
    image: "https://images.pexels.com/photos/3028139/pexels-photo-3028139.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    sizes: JSON.stringify([
      { label: "300ML", price: 33.00 },
      { label: "500ML", price: 42.00 },
      { label: "700ML", price: 50.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "5.0",
    reviewsCount: 47,
    isFeatured: true,
  },
  {
    id: "acai-chocolatudo",
    name: "Açaí Chocolatudo",
    description: "Para os chocólatras! Açaí cremoso com chocolate belga, mousse de chocolate ao leite e raspas de chocolate meio amargo crocantes.",
    category: "premium",
    image: "https://images.pexels.com/photos/3035261/pexels-photo-3035261.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([
      { label: "300ML", price: 25.00 },
      { label: "500ML", price: 33.00 },
      { label: "700ML", price: 38.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "4.8",
    reviewsCount: 23,
    isFeatured: false,
  },
  {
    id: "copo-da-felicidade",
    name: "Copo da Felicidade",
    description: "Uma verdadeira torre de delícias! Brownie de chocolate, morangos frescos e Nutella genuína, combinados com o nosso creme de Ninho ou brigadeiro belga (ou os dois misturados).",
    category: "premium",
    image: "https://images.pexels.com/photos/7656565/pexels-photo-7656565.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    sizes: JSON.stringify([
      { label: "300ML", price: 32.00 },
      { label: "500ML", price: 45.00 },
      { label: "700ML", price: 57.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "5.0",
    reviewsCount: 61,
    isFeatured: true,
  },
  {
    id: "brownie-felicidade-suprema",
    name: "Brownie Felicidade Suprema",
    description: "Brownie quadrado de 80g como base, coberto com uma generosa camada de creme de Ninho, brigadeiro belga ou misto. Acompanha uma bola irresistível de sorvete de creme e morangos frescos.",
    category: "sobremesa",
    image: "https://images.pexels.com/photos/5639261/pexels-photo-5639261.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    sizes: JSON.stringify([{ label: "Porção Única", price: 23.00 }]),
    freeToppingsLimit: 0,
    rating: "4.9",
    reviewsCount: 34,
    isFeatured: true,
  },
  {
    id: "roleta-fundi",
    name: "Roleta Fundi",
    description: "Uma roleta repleta de delícias para você se esbaldar! Vem com banana, morango, uva e cubos de brownie, com um creme especial no centro à sua escolha: doce de leite, brigadeiro belga ou creme de Ninho.",
    category: "sobremesa",
    image: "https://images.pexels.com/photos/6441084/pexels-photo-6441084.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    sizes: JSON.stringify([{ label: "Porção Família", price: 30.00 }]),
    freeToppingsLimit: 0,
    rating: "4.9",
    reviewsCount: 27,
    isFeatured: false,
  },
  {
    id: "salada-de-frutas",
    name: "Salada de Frutas",
    description: "Frutas fresquinhas e selecionadas: morango, mamão, melão, banana, abacaxi, uva e manga, envolvidas no nosso creme artesanal de Ninho. Extremamente leve e refrescante!",
    category: "sobremesa",
    image: "https://images.pexels.com/photos/12174224/pexels-photo-12174224.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    sizes: JSON.stringify([
      { label: "300ML", price: 25.00 },
      { label: "500ML", price: 30.00 },
      { label: "700ML", price: 40.00 }
    ]),
    freeToppingsLimit: 0,
    rating: "4.8",
    reviewsCount: 16,
    isFeatured: false,
  },
  {
    id: "bombom-de-morango",
    name: "Bombom de Morango",
    description: "Morangos frescos cortados intercalados com camadas de creme à sua escolha: creme de Ninho, brigadeiro belga ou misto dos dois. Uma sobremesa leve e indulgente.",
    category: "sobremesa",
    image: "https://images.pexels.com/photos/4421615/pexels-photo-4421615.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    sizes: JSON.stringify([{ label: "300ML", price: 25.00 }]),
    freeToppingsLimit: 0,
    rating: "4.9",
    reviewsCount: 21,
    isFeatured: false,
  }
];

export const TOPPINGS_FREE_GARRAFA = [
  "Leite Condensado",
  "Leite em Pó",
  "Paçoca",
  "Farinha Láctea",
  "Granola",
  "Ovomaltine",
  "Amendoim",
  "Banana",
  "Abacaxi",
  "Kiwi",
  "Mamão",
  "Manga"
];

export const TOPPINGS_FREE_TRADICIONAL = [
  "Leite Condensado", "Leite em Pó", "Paçoca", "Granola", "Gotas de Chocolate", 
  "Disquetes", "Chocopower", "Canudo de Chocolate", "Ovomaltine", "Bolacha Oreo", 
  "Farinha Láctea", "Amendoim", "Sucrilhos", "Bis", "Banana", "Uva", 
  "Coco Ralado", "Abacaxi", "Kiwi", "Manga", "Mamão"
];

export const TOPPINGS_PAID_GARRAFA = [
  { name: "Creme de Beijinho 50g", price: 8.00 },
  { name: "Creme de Ninho 50g", price: 8.00 },
  { name: "Creme Brigadeiro Belga 50g", price: 8.00 },
  { name: "Creme de Oreo 50g", price: 8.00 },
  { name: "Doce de Leite 50g", price: 8.00 },
  { name: "Creme de Amendoim 50g", price: 8.00 },
  { name: "Morango", price: 5.00 }
];

export const TOPPINGS_PAID_TRADICIONAL = [
  { name: "Kinder Bueno", price: 7.00 },
  { name: "Morango 70g", price: 8.00 },
  { name: "Suflair 4 un.", price: 6.00 },
  { name: "Kitkat 2 un.", price: 5.00 },
  { name: "Cereja 4 un.", price: 6.00 },
  { name: "Sonho de Valsa 2 un.", price: 5.00 },
  { name: "Ouro Branco 2 un.", price: 5.00 },
  { name: "Nutella 50g", price: 8.00 },
  { name: "Creme de Beijinho 50g", price: 9.00 },
  { name: "Creme de Ninho 50g", price: 8.00 },
  { name: "Creme Brigadeiro Belga 50g", price: 9.00 },
  { name: "Creme de Oreo 50g", price: 9.00 },
  { name: "Doce de Leite 50g", price: 8.00 },
  { name: "Creme de Amendoim 50g", price: 8.00 }
];

export const PRESET_REVIEWS = [
  { author: "Mariana Silva", rating: 5, comment: "Melhor açaí da cidade! A entrega foi super rápida e o açaí chegou bem gelado. O creme de ninho é espetacular." },
  { author: "João Pedro Santos", rating: 5, comment: "Excelente custo-benefício. A barca é gigante e veio muito bem recheada. Recomendo muito!" },
  { author: "Ana Clara Oliveira", rating: 5, comment: "D'Gust é simplesmente imbatível. O copo da felicidade é surreal de bom, vale cada centavo." },
  { author: "Lucas Fernandes", rating: 4, comment: "Adoro o açaí na garrafa, muito prático para tomar no trabalho. Os adicionais vieram bem misturados." },
  { author: "Beatriz Costa", rating: 5, comment: "Sempre peço a marmita e nunca me decepciono. Qualidade impecável e atendimento excelente." }
];

export async function seedIfEmpty() {
  try {
    const existing = await db.select().from(products).limit(1);
    if (existing.length === 0) {
      console.log("Seeding D'Gust Açai products database...");
      
      // Seed products
      for (const prod of PRODUCT_DATA) {
        await db.insert(products).values(prod);
      }

      // Seed some reviews for all products
      const allInsertedProducts = await db.select().from(products);
      for (const prod of allInsertedProducts) {
        // Seed 2-3 reviews per product randomly
        const shuffle = [...PRESET_REVIEWS].sort(() => 0.5 - Math.random());
        const count = Math.floor(Math.random() * 2) + 2; // 2 or 3
        for (let i = 0; i < count; i++) {
          await db.insert(reviews).values({
            productId: prod.id,
            author: shuffle[i].author,
            rating: shuffle[i].rating,
            comment: shuffle[i].comment,
          });
        }
      }
      console.log("Database seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
