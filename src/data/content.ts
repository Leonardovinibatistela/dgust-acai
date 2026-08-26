export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  size: string;
  image: string;
  badge?: string;
  toppings: string[];
  kcal: string;
};

export const products: Product[] = [
  {
    id: "classico",
    name: "Dgust Clássico",
    tagline: "O favorito de sempre",
    description:
      "Nosso açaí cremoso tradicional coberto com granola artesanal crocante, banana fresca em rodelas e um fio de mel puro.",
    price: 21.9,
    size: "500ml",
    image: "/images/bowl-classico.jpg",
    badge: "Queridinho",
    toppings: ["Granola artesanal", "Banana fresca", "Mel puro"],
    kcal: "420 kcal",
  },
  {
    id: "premium",
    name: "Dgust Premium",
    tagline: "Puro desejo em camadas",
    description:
      "Açaí extra cremoso com cascatas de creme de avelã, morangos frescos, castanhas trituradas e raspas de chocolate belga.",
    price: 27.9,
    size: "500ml",
    image: "/images/bowl-premium.jpg",
    badge: "Mais pedido",
    toppings: ["Creme de avelã", "Morango", "Castanhas", "Chocolate belga"],
    kcal: "610 kcal",
  },
  {
    id: "tropical",
    name: "Dgust Tropical",
    tagline: "Verão no copo",
    description:
      "Açaí batido com manga madura, maracujá gelado, flocos de coco fresco e chia — uma viagem ao litoral em cada colherada.",
    price: 25.9,
    size: "500ml",
    image: "/images/bowl-tropical.jpg",
    badge: "Novidade",
    toppings: ["Manga", "Maracujá", "Coco fresco", "Chia"],
    kcal: "380 kcal",
  },
  {
    id: "fit",
    name: "Dgust Fit Protein",
    tagline: "Gostoso e funcional",
    description:
      "Açaí sem açúcar adicionado, reforçado com whey protein, pasta de amendoim, aveia, chia e frutas vermelhas. Pós-treino dos sonhos.",
    price: 29.9,
    size: "500ml",
    image: "/images/bowl-fit.jpg",
    toppings: ["Whey protein", "Pasta de amendoim", "Aveia", "Frutas vermelhas"],
    kcal: "440 kcal",
  },
];

export type Testimonial = {
  name: string;
  initials: string;
  neighborhood: string;
  quote: string;
  rating: number;
  hue: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Mariana Silva",
    initials: "MS",
    neighborhood: "Jardins, São Paulo",
    quote:
      "Sinceramente? O açaí mais cremoso que já comi na vida. Chegou geladinho, com as frutas impecáveis. Virei cliente fiel do Dgust.",
    rating: 5,
    hue: "from-violet-500 to-fuchsia-500",
  },
  {
    name: "Rafael Torres",
    initials: "RT",
    neighborhood: "Botafogo, Rio de Janeiro",
    quote:
      "Pedi às 21h e em 22 minutos estava na minha porta. O Premium com creme de avelã é perigoso — não consigo parar de pedir.",
    rating: 5,
    hue: "from-fuchsia-500 to-pink-500",
  },
  {
    name: "Camila Ribeiro",
    initials: "CR",
    neighborhood: "Savassi, Belo Horizonte",
    quote:
      "Como atleta, o Fit Protein salvou minhas tardes. Sabor incrível sem açúcar adicionado e com proteína de verdade. Nota mil.",
    rating: 5,
    hue: "from-purple-500 to-indigo-500",
  },
  {
    name: "João Pedro Alves",
    initials: "JP",
    neighborhood: "Boa Viagem, Recife",
    quote:
      "O Combo Família virou tradição no nosso sábado. Chega tudo certinho, bem embalado e ainda mais gelado que o de casa.",
    rating: 5,
    hue: "from-amber-400 to-orange-500",
  },
  {
    name: "Beatriz Lima",
    initials: "BL",
    neighborhood: "Centro, Curitiba",
    quote:
      "A embalagem é um mimo, o sabor é surreal e o atendimento no WhatsApp responde em segundos. Experiência de marca premium de verdade.",
    rating: 5,
    hue: "from-rose-400 to-fuchsia-500",
  },
  {
    name: "Fernanda Martins",
    initials: "FM",
    neighborhood: "Meireles, Fortaleza",
    quote:
      "Tropical com manga e maracujá é o meu vício. Dá pra sentir que é fruta de verdade, sem aquele sabor artificial de pó. Aprovadíssimo.",
    rating: 5,
    hue: "from-violet-500 to-purple-600",
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "Qual é a área de entrega do Dgust Açai?",
    answer:
      "Entregamos em Matupá e região. É só fazer o pedido pelo WhatsApp com seu endereço que confirmamos na hora se chegamos até você.",
  },
  {
    question: "Em quanto tempo meu pedido chega?",
    answer:
      "Nossa média é de 25 minutos, e o prazo máximo prometido é de 30 minutos em horários de pico. Cada pedido sai da nossa cozinha em embalagem térmica que conserva o açaí geladinho do jeito que ele merece.",
  },
  {
    question: "O açaí é 100% natural mesmo?",
    answer:
      "Sim. Trabalhamos com polpa de açaí premium selecionada, sem conservantes, sem corantes e sem aromatizantes artificiais. As frutas dos toppings são entregues fresquinhas todos os dias pelos nossos fornecedores parceiros.",
  },
  {
    question: "Quais formas de pagamento vocês aceitam?",
    answer:
      "Pix, cartões de crédito e débito (Visa, Mastercard, Elo) e pagamento na entrega.",
  },
];

export const stats = [
  { value: 50, suffix: " mil+", label: "pedidos entregues" },
  { value: 4.9, suffix: "/5", label: "avaliação média", decimals: 1 },
  { value: 98, suffix: "%", label: "dos clientes voltam" },
  { value: 25, suffix: " min", label: "entrega média" },
];

export const marqueeItems = [
  "Açaí 100% natural",
  "Entrega em até 30 min",
  "Granola artesanal",
  "Frutas fresquinhas todo dia",
  "Monte do seu jeito",
  "Pagamento na entrega",
  "Embalagem térmica premium",
];
