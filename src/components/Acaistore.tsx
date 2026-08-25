"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ShoppingBag, Star, X, Plus, Minus, Search, Sparkles, Phone, 
  MapPin, Truck, ShieldCheck, Heart, ArrowRight, Send, CheckCircle2, 
  ChevronRight, Menu, Check, ShoppingCart, Info, MessageSquare, Award,
  Clock, Motorbike, AlertCircle, Share2, Compass, Trash2, CheckCircle
} from "lucide-react";
import { 
  getProducts, getProductById, createReview, createOrder 
} from "../app/actions";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  sizes: string; // JSON string of label & price
  freeToppingsLimit: number;
  rating: string;
  reviewsCount: number;
  isFeatured: boolean;
}

interface Review {
  id: number;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: any;
}

interface CartItem {
  cartId: string; // unique hash
  productId: string;
  name: string;
  image: string;
  size: string;
  price: number; // calculated single item price (base + paid toppings)
  quantity: number;
  freeToppings: string[];
  paidToppings: Array<{ name: string; price: number }>;
}

// Static toppings data helper
const TOPPINGS_FREE_GARRAFA = [
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

const TOPPINGS_FREE_TRADICIONAL = [
  "Leite Condensado", "Leite em Pó", "Paçoca", "Granola", "Gotas de Chocolate", 
  "Disquetes", "Chocopower", "Canudo de Chocolate", "Ovomaltine", "Bolacha Oreo", 
  "Farinha Láctea", "Amendoim", "Sucrilhos", "Bis", "Banana", "Uva", 
  "Coco Ralado", "Abacaxi", "Kiwi", "Manga", "Mamão"
];

const TOPPINGS_PAID_GARRAFA = [
  { name: "Creme de Beijinho 50g", price: 8.00 },
  { name: "Creme de Ninho 50g", price: 8.00 },
  { name: "Creme Brigadeiro Belga 50g", price: 8.00 },
  { name: "Creme de Oreo 50g", price: 8.00 },
  { name: "Doce de Leite 50g", price: 8.00 },
  { name: "Creme de Amendoim 50g", price: 8.00 },
  { name: "Morango", price: 5.00 }
];

const TOPPINGS_PAID_TRADICIONAL = [
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

export default function Acaistore() {
  // Navigation & Category filter
  const [activeCategory, setActiveCategory] = useState("todos");
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Selected item customizer modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<{
    product: Product;
    reviews: Review[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Customizer state
  const [selectedSize, setSelectedSize] = useState<{ label: string; price: number } | null>(null);
  const [selectedFreeToppings, setSelectedFreeToppings] = useState<string[]>([]);
  const [selectedPaidToppings, setSelectedPaidToppings] = useState<Array<{ name: string; price: number }>>([]);
  const [customizerQuantity, setCustomizerQuantity] = useState(1);

  // Review states
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  // Checkout states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("delivery"); // "delivery" | "pickup"
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix"); // "pix" | "card" | "cash"
  const [changeFor, setChangeFor] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);

  // Categories list
  const categories = [
    { id: "todos", label: "Tudo", emoji: "✨" },
    { id: "premium", label: "Açaí Premium", emoji: "🏆" },
    { id: "garrafa", label: "Na Garrafa", emoji: "🍼" },
    { id: "tradicional", label: "Tradicional", emoji: "🥣" },
    { id: "barca_marmita", label: "Barcas & Marmitas", emoji: "🛶" },
    { id: "sobremesa", label: "Sobremesas", emoji: "🍓" }
  ];

  // Fetch products
  useEffect(() => {
    async function load() {
      setLoadingProducts(true);
      const res = await getProducts(activeCategory, sortBy, search);
      if (res.success && res.products) {
        setProductsList(res.products as Product[]);
      }
      setLoadingProducts(false);
    }
    load();
  }, [activeCategory, sortBy, search]);

  // Read cart
  useEffect(() => {
    const saved = localStorage.getItem("dgust_cart_digital");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("dgust_cart_digital", JSON.stringify(newCart));
  };

  const handleOpenCustomizer = async (product: Product) => {
    setSelectedProduct(product);
    setLoadingDetails(true);
    setIsCustomizerOpen(true);
    setCustomizerQuantity(1);

    const sizesArr = JSON.parse(product.sizes);
    if (sizesArr.length > 0) {
      setSelectedSize(sizesArr[0]);
    }

    setSelectedFreeToppings([]);
    setSelectedPaidToppings([]);
    setNewReviewName("");
    setNewReviewComment("");
    setNewReviewRating(5);
    setReviewMessage("");

    const res = await getProductById(product.id);
    if (res.success && res.product) {
      setSelectedProductDetails({
        product: res.product as Product,
        reviews: (res.reviews || []) as Review[]
      });
    }
    setLoadingDetails(false);
  };

  const getToppingsLists = () => {
    if (!selectedProduct) return { free: [], paid: [], limit: 0 };
    
    let freeList: string[] = [];
    let paidList: Array<{ name: string; price: number }> = [];
    let limit = selectedProduct.freeToppingsLimit;
    
    if (selectedProduct.category === "garrafa") {
      freeList = TOPPINGS_FREE_GARRAFA;
      paidList = TOPPINGS_PAID_GARRAFA;
    } else if (selectedProduct.category === "tradicional") {
      freeList = TOPPINGS_FREE_TRADICIONAL;
      paidList = TOPPINGS_PAID_TRADICIONAL;
    } else if (selectedProduct.category === "barca_marmita") {
      freeList = TOPPINGS_FREE_TRADICIONAL;
      paidList = TOPPINGS_PAID_TRADICIONAL;
    } else {
      freeList = [];
      paidList = TOPPINGS_PAID_TRADICIONAL;
      limit = 0;
    }
    
    return { free: freeList, paid: paidList, limit };
  };

  const { free: freeOptions, paid: paidOptions, limit: freeLimit } = getToppingsLists();

  const handleToggleFreeTopping = (top: string) => {
    if (selectedFreeToppings.includes(top)) {
      setSelectedFreeToppings(selectedFreeToppings.filter(t => t !== top));
    } else {
      if (selectedFreeToppings.length < freeLimit) {
        setSelectedFreeToppings([...selectedFreeToppings, top]);
      }
    }
  };

  const handleTogglePaidTopping = (top: { name: string; price: number }) => {
    if (selectedPaidToppings.some(t => t.name === top.name)) {
      setSelectedPaidToppings(selectedPaidToppings.filter(t => t.name !== top.name));
    } else {
      setSelectedPaidToppings([...selectedPaidToppings, top]);
    }
  };

  const calculateSinglePrice = () => {
    if (!selectedSize) return 0;
    const extraPrice = selectedPaidToppings.reduce((sum, t) => sum + t.price, 0);
    return selectedSize.price + extraPrice;
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSize) return;

    const singlePrice = calculateSinglePrice();
    const freeHash = [...selectedFreeToppings].sort().join(",");
    const paidHash = [...selectedPaidToppings].map(t => t.name).sort().join(",");
    const cartId = `${selectedProduct.id}-${selectedSize.label}-${freeHash}-${paidHash}`;

    const existingIndex = cart.findIndex(item => item.cartId === cartId);
    let newCart = [...cart];

    if (existingIndex > -1) {
      newCart[existingIndex].quantity += customizerQuantity;
    } else {
      newCart.push({
        cartId,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        image: selectedProduct.image,
        size: selectedSize.label,
        price: singlePrice,
        quantity: customizerQuantity,
        freeToppings: selectedFreeToppings,
        paidToppings: selectedPaidToppings
      });
    }

    saveCart(newCart);
    setIsCustomizerOpen(false);
  };

  const handleUpdateCartQty = (cartId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.cartId === cartId) {
        const nQ = item.quantity + delta;
        return nQ > 0 ? { ...item, quantity: nQ } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  const handleRemoveFromCart = (cartId: string) => {
    const updated = cart.filter(item => item.cartId !== cartId);
    saveCart(updated);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getDeliveryFee = () => {
    if (deliveryMethod === "pickup") return 0;
    const sub = getCartSubtotal();
    return sub >= 50 ? 0 : 5.00;
  };

  const getCartTotal = () => {
    return getCartSubtotal() + getDeliveryFee();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setSubmittingReview(true);
    const res = await createReview(selectedProduct.id, newReviewName, newReviewRating, newReviewComment);
    setSubmittingReview(false);

    if (res.success) {
      setReviewMessage("Sua avaliação foi enviada! Obrigado por ajudar o D'Gust a crescer! ⭐");
      setNewReviewName("");
      setNewReviewComment("");
      
      const updated = await getProductById(selectedProduct.id);
      if (updated.success && updated.product) {
        setSelectedProductDetails({
          product: updated.product as Product,
          reviews: (updated.reviews || []) as Review[]
        });
      }
    } else {
      setReviewMessage("Não foi possível enviar a avaliação. Tente novamente.");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmittingOrder(true);
    const itemsInput = cart.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      size: item.size,
      price: item.price,
      freeToppings: item.freeToppings,
      paidToppings: item.paidToppings.map(t => ({ name: t.name, price: t.price }))
    }));

    const res = await createOrder({
      customerName,
      customerPhone,
      customerAddress: deliveryMethod === "delivery" ? customerAddress : "Retirada no Balcão",
      customerCity: deliveryMethod === "delivery" ? customerCity : "N/A",
      deliveryMethod,
      paymentMethod,
      total: getCartTotal(),
      items: itemsInput
    });

    setIsSubmittingOrder(false);

    if (res.success && res.orderId) {
      setCreatedOrderCode(res.orderId);
    } else {
      alert("Houve um erro ao registrar seu pedido. Tente novamente.");
    }
  };

  const handleSendWhatsApp = () => {
    if (!createdOrderCode) return;

    let msg = `*🟣 NOVO PEDIDO - D'GUST AÇAÍ 🟣*\n`;
    msg += `-------------------------------------------\n`;
    msg += `*Pedido:* \`${createdOrderCode}\`\n`;
    msg += `*Cliente:* ${customerName}\n`;
    msg += `*Telefone:* ${customerPhone}\n`;
    msg += `*Método:* ${deliveryMethod === "delivery" ? "🚀 Entrega" : "🛍️ Retirada"}\n`;
    
    if (deliveryMethod === "delivery") {
      msg += `*Endereço:* ${customerAddress} - ${customerCity}\n`;
    }
    
    msg += `*Pagamento:* ${paymentMethod.toUpperCase()}`;
    if (paymentMethod === "cash" && changeFor) {
      msg += ` (Troco para R$ ${changeFor})`;
    }
    msg += `\n-------------------------------------------\n\n`;
    msg += `*🛒 CESTA DE COMPRAS:*\n\n`;

    cart.forEach((item, index) => {
      msg += `*${index + 1}. ${item.name} (${item.size})* x${item.quantity}\n`;
      if (item.freeToppings.length > 0) {
        msg += ` ↳ Grátis: ${item.freeToppings.join(", ")}\n`;
      }
      if (item.paidToppings.length > 0) {
        msg += ` ↳ Extras: ${item.paidToppings.map(t => t.name).join(", ")}\n`;
      }
      msg += ` ↳ Valor: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    msg += `-------------------------------------------\n`;
    msg += `*Subtotal:* R$ ${getCartSubtotal().toFixed(2)}\n`;
    if (deliveryMethod === "delivery") {
      msg += `*Taxa de entrega:* ${getDeliveryFee() === 0 ? "GRÁTIS" : `R$ ${getDeliveryFee().toFixed(2)}`}\n`;
    }
    msg += `*TOTAL GERAL:* R$ ${getCartTotal().toFixed(2)}\n`;
    msg += `-------------------------------------------\n\n`;
    msg += `_Obrigado por pedir na D'Gust Açaí! Seu açaí já está sendo preparado com muito amor! 💜✨_`;

    const encoded = encodeURIComponent(msg);
    // WhatsApp redirect link
    window.open(`https://wa.me/5511999999999?text=${encoded}`, "_blank");

    // Clear cart and close modals
    saveCart([]);
    setIsCheckoutOpen(false);
    setCreatedOrderCode(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#2D0B2E] font-sans antialiased pb-24 selection:bg-[#581C5C] selection:text-white">
      
      {/* 1. TOP BRAND COVER HEADER - OlaClick/iFood Inspired */}
      <div className="relative h-44 sm:h-56 bg-purple-950 overflow-hidden">
        {/* Colorful Abstract Açaí Background details */}
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/9102652/pexels-photo-9102652.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')] bg-cover bg-center opacity-45 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-purple-950/70 to-transparent"></div>
        
        {/* Quick Badge buttons inside cover */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-white animate-ping mr-1"></span>
            Aberto
          </span>
          <span className="bg-[#F49D06] text-[#331135] text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>25-45m</span>
          </span>
        </div>
      </div>

      {/* 2. D'GUST LOGO & PROFILE CARD */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-500/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
            
            {/* Logo Avatar */}
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-[#581C5C] to-[#F49D06] p-1.5 shadow-2xl flex-shrink-0 -mt-16 sm:-mt-20">
              <div className="bg-[#581C5C] h-full w-full rounded-xl flex items-center justify-center text-white font-black text-3xl sm:text-4xl tracking-tighter border-2 border-white/20">
                D'G
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-3xl font-black text-[#581C5C] tracking-tight">D'Gust Açaí</h1>
                <span className="bg-purple-100 text-[#581C5C] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center">
                  <Award className="h-3 w-3 mr-1 text-purple-700" /> Oficial
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Açaí cremoso de alta qualidade para todas as idades. Monte o seu com mais de 25 acompanhamentos grátis e caldas gourmet!
              </p>

              {/* Badges strip */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-gray-600 font-medium">
                <span className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  <span className="font-bold text-[#2D0B2E]">4.9</span>
                  <span className="text-gray-400 ml-1">(120+ avaliações)</span>
                </span>
                <span className="flex items-center">
                  <Truck className="h-4 w-4 text-purple-700 mr-1" />
                  <span>Entrega R$ 5,00 ou grátis &gt; R$ 50</span>
                </span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 text-red-500 mr-1" />
                  <span>Jardim das Oliveiras, SP</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. STICKY CATEGORIES BAR & SEARCH */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-purple-100 py-3 mt-6">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          
          {/* Search bar inside header */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 O que você quer tomar hoje? Pesquise ex: Ninho, Morango, Barca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#581C5C] text-sm text-[#2D0B2E] shadow-sm"
            />
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-4 top-3 text-gray-400 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Horizontal scrollable categories */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeCategory === cat.id
                    ? "bg-[#581C5C] text-white shadow-md shadow-purple-900/10 transform scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 4. THE CARDÁPIO LIST - Clean delivery style rows as requested */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-8">
        
        {loadingProducts ? (
          // Skeletons
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 flex items-center justify-between gap-4 animate-pulse border border-gray-100">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-24 w-24 bg-gray-200 rounded-2xl flex-shrink-0"></div>
              </div>
            ))}
          </div>
        ) : productsList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-gray-200 shadow-sm">
            <span className="text-5xl block">🥣</span>
            <h3 className="text-xl font-bold">Nenhum açaí encontrado</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Experimente limpar o termo de pesquisa ou mudar a categoria selecionada!
            </p>
            <button
              onClick={() => {
                setActiveCategory("todos");
                setSearch("");
              }}
              className="bg-[#581C5C] text-white px-5 py-2.5 rounded-full font-bold text-xs"
            >
              Ver Todo o Cardápio
            </button>
          </div>
        ) : (
          // Render grouped by Category
          <div className="space-y-10">
            {categories.filter(c => c.id !== "todos").map((cat) => {
              const itemsInCat = productsList.filter(p => p.category === cat.id);
              if (itemsInCat.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-4">
                  
                  {/* Category Title Header */}
                  <div className="flex items-center space-x-2 border-b border-purple-100 pb-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <h2 className="text-lg font-black text-[#581C5C] tracking-tight uppercase">
                      {cat.label}
                    </h2>
                    <span className="text-xs text-gray-400">({itemsInCat.length})</span>
                  </div>

                  {/* List of horizontal rows */}
                  <div className="space-y-3.5">
                    {itemsInCat.map((prod) => {
                      const sizes = JSON.parse(prod.sizes);
                      const basePrice = sizes.length > 0 ? sizes[0].price : 0;
                      const hasMultipleSizes = sizes.length > 1;

                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleOpenCustomizer(prod)}
                          className="bg-white rounded-2xl p-4 flex items-center justify-between gap-4 border border-gray-200/60 hover:border-[#581C5C]/30 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                        >
                          {/* Item Left Info */}
                          <div className="flex-1 space-y-1.5 min-w-0">
                            
                            {/* Stars rating small badge */}
                            <div className="flex items-center space-x-1 text-amber-500 text-[10px] font-bold">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{prod.rating}</span>
                              <span className="text-gray-400">({prod.reviewsCount})</span>
                              {prod.isFeatured && (
                                <span className="bg-red-50 text-red-600 text-[9px] px-1.5 py-0.2 rounded ml-2 uppercase tracking-wide font-black">
                                  Mais Vendido 🔥
                                </span>
                              )}
                            </div>

                            <h3 className="font-extrabold text-[#581C5C] text-base group-hover:text-purple-800 transition-colors">
                              {prod.name}
                            </h3>

                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {prod.description}
                            </p>

                            <div className="pt-1 flex items-center space-x-2">
                              <span className="text-base font-black text-[#F49D06]">
                                R$ {basePrice.toFixed(2)}
                              </span>
                              {hasMultipleSizes && (
                                <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-1.5 py-0.5 rounded">
                                  {sizes.length} opções de tamanho
                                </span>
                              )}
                            </div>

                          </div>

                          {/* Item Right Image + Float add button */}
                          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl bg-purple-50 flex-shrink-0 overflow-hidden shadow-inner border border-gray-100">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            
                            {/* Float ADD button */}
                            <div className="absolute bottom-1 right-1">
                              <span className="bg-[#581C5C] hover:bg-[#F49D06] text-white hover:text-[#581C5C] px-2.5 py-1 rounded-lg text-[11px] font-black shadow-lg flex items-center space-x-0.5 transition-colors">
                                <Plus className="h-3 w-3" />
                                <span>Add</span>
                              </span>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 5. GORGEOUS DIGITAL CUSTOMIZER MODAL */}
      {isCustomizerOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Image Header */}
            <div className="relative h-48 bg-purple-950 flex-shrink-0">
              <img src={selectedProduct.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
              
              {/* Close Button */}
              <button
                onClick={() => setIsCustomizerOpen(false)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-[10px] uppercase font-bold text-yellow-300 tracking-widest">{selectedProduct.category}</span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{selectedProduct.name}</h2>
              </div>
            </div>

            {/* Scrollable Customize Section */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* Product description info text */}
              <p className="text-xs text-gray-500 bg-[#FAF6EE] p-3.5 rounded-xl border border-yellow-600/10 leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Step 1: SELECT SIZE */}
              <div className="space-y-2.5">
                <span className="block text-xs font-black uppercase text-gray-400 tracking-wider">Passo 1: Selecione o tamanho</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {JSON.parse(selectedProduct.sizes).map((sz: { label: string; price: number }) => (
                    <button
                      key={sz.label}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedSize?.label === sz.label
                          ? "border-[#581C5C] bg-purple-50 text-[#581C5C] font-bold"
                          : "border-gray-200 bg-white hover:border-gray-300 text-xs font-semibold"
                      }`}
                    >
                      <span className="block text-[11px] uppercase tracking-wider">{sz.label}</span>
                      <span className="block text-xs text-[#F49D06] font-black mt-0.5">R$ {sz.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: FREE TOPPINGS */}
              {freeLimit > 0 && (
                <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-500/5">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-black uppercase text-[#581C5C] tracking-wider">Passo 2: Adicionais Grátis</span>
                    <span className="bg-[#581C5C] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {selectedFreeToppings.length} de {freeLimit}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">Escolha até {freeLimit} acompanhamentos inclusos grátis na sua garrafa/copo:</p>

                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {freeOptions.map((top) => {
                      const isSelected = selectedFreeToppings.includes(top);
                      const disabled = !isSelected && selectedFreeToppings.length >= freeLimit;

                      return (
                        <button
                          key={top}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleToggleFreeTopping(top)}
                          className={`p-2 rounded-xl text-left text-xs border flex items-center justify-between transition-all ${
                            isSelected
                              ? "bg-[#581C5C] text-white border-[#581C5C] font-semibold"
                              : disabled
                                ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
                                : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          <span className="truncate">{top}</span>
                          {isSelected ? (
                            <Check className="h-3.5 w-3.5 text-yellow-300 flex-shrink-0" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: GOURMET EXTRA PAID TOPPINGS */}
              {paidOptions.length > 0 && (
                <div className="space-y-3 bg-amber-50/35 p-4 rounded-2xl border border-yellow-600/10">
                  <span className="block text-xs font-black uppercase text-gray-500 tracking-wider">Passo 3: Cremes & Chocolates Extras (Opcional)</span>
                  <p className="text-[11px] text-gray-500">Adicione caldas nobres, cremes e chocolates para turbinar:</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                    {paidOptions.map((top) => {
                      const isSelected = selectedPaidToppings.some(t => t.name === top.name);

                      return (
                        <button
                          key={top.name}
                          type="button"
                          onClick={() => handleTogglePaidTopping(top)}
                          className={`p-2 rounded-xl text-left text-xs border flex items-center justify-between transition-all ${
                            isSelected
                              ? "bg-[#F49D06] text-[#331135] border-[#F49D06] font-black"
                              : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
                          }`}
                        >
                          <span className="truncate">{top.name}</span>
                          <span className="text-[#F49D06] group-hover:text-white font-black ml-2 whitespace-nowrap">
                            +R$ {top.price.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* REVIEWS COLLAPSIBLE OR ACCORDION */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <span className="text-xs font-black uppercase text-gray-400 tracking-wider block">O que dizem os clientes:</span>
                
                {loadingDetails ? (
                  <p className="text-[11px] text-gray-400 animate-pulse">Carregando opiniões...</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProductDetails?.reviews && selectedProductDetails.reviews.length > 0 ? (
                      selectedProductDetails.reviews.slice(0, 2).map((rev) => (
                        <div key={rev.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[11px] space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span>{rev.author}</span>
                            <span className="text-amber-500">{"⭐".repeat(rev.rating)}</span>
                          </div>
                          <p className="text-gray-600 leading-normal italic">"{rev.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">Nenhuma opinião registrada ainda. Faça seu pedido e avalie!</p>
                    )}

                    {/* Quick submit review inside customizer */}
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-200 space-y-2">
                      <p className="text-[10px] font-bold text-[#581C5C]">Já provou? Avalie agora:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Seu nome"
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          className="p-1.5 rounded bg-white text-[10px] border border-gray-300 focus:outline-none"
                        />
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="p-1.5 rounded bg-white text-[10px] border border-gray-300 focus:outline-none"
                        >
                          <option value={5}>5 Estrelas ⭐</option>
                          <option value={4}>4 Estrelas ⭐</option>
                          <option value={3}>3 Estrelas ⭐</option>
                        </select>
                      </div>
                      <input 
                        type="text" 
                        placeholder="O que achou do sabor?"
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="w-full p-1.5 rounded bg-white text-[10px] border border-gray-300 focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={handleSubmitReview}
                        className="w-full bg-[#581C5C] text-white py-1 rounded text-[10px] font-bold"
                      >
                        Enviar Opinião
                      </button>
                      {reviewMessage && <p className="text-[9px] text-green-700 text-center font-bold">{reviewMessage}</p>}
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Footer with Item Quantity controls & Add CTA */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0">
              
              {/* Quantity Selector */}
              <div className="flex items-center space-x-3 bg-white rounded-full border border-gray-200 p-1 px-3">
                <button
                  type="button"
                  onClick={() => setCustomizerQuantity(Math.max(1, customizerQuantity - 1))}
                  className="text-gray-500 hover:text-red-500 p-1"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-bold text-sm">{customizerQuantity}</span>
                <button
                  type="button"
                  onClick={() => setCustomizerQuantity(customizerQuantity + 1)}
                  className="text-gray-500 hover:text-green-500 p-1"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="flex-1 bg-[#581C5C] hover:bg-[#F49D06] text-white hover:text-[#581C5C] font-black py-3 px-6 rounded-full text-xs shadow-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Adicionar • R$ {(calculateSinglePrice() * customizerQuantity).toFixed(2)}</span>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* 6. CESTA DE COMPRAS / VER SACOLA FLOATING BOTTOM BAR (As requested: "igual a da b" standard digital menu checkout triggers) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40 animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div 
            onClick={() => setIsCartOpen(true)}
            className="bg-[#581C5C] text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl hover:bg-purple-900 cursor-pointer border border-[#F49D06]/30 transform hover:scale-[1.02] active:scale-95 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="relative bg-white/20 p-2.5 rounded-xl">
                <ShoppingBag className="h-5 w-5 text-white" />
                <span className="absolute -top-2 -right-2 bg-[#F49D06] text-[#331135] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-[#581C5C]">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-purple-200 uppercase tracking-widest font-bold">Sua Cesta / Sacola</p>
                <p className="text-sm font-bold">Ver itens adicionados</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-base font-black text-[#F49D06]">R$ {getCartSubtotal().toFixed(2)}</span>
              <ChevronRight className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* 7. SLIDE-UP CART BOTTOM SHEET */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="bg-[#581C5C] text-white p-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-[#F49D06]" />
                <h3 className="font-extrabold text-base uppercase">Sua Cesta de Compras D'Gust</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="bg-purple-950 p-1.5 rounded-full hover:bg-red-600 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cart Scrollable Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <span className="text-5xl block">🛒</span>
                  <h4 className="font-bold text-gray-700">Sua cesta está vazia</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">Navegue pelo cardápio, adicione os melhores açaís e sobremesas para encher de alegria!</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-[#581C5C] text-white px-4 py-2 rounded-full text-xs font-bold"
                  >
                    Voltar para o Cardápio
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="bg-slate-50 p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between space-y-2">
                    
                    {/* Upper row */}
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-purple-100 flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-[#581C5C] truncate">{item.name}</h4>
                        <p className="text-xs text-amber-600 font-bold">{item.size}</p>
                        
                        {/* Custom toppings summary */}
                        {(item.freeToppings.length > 0 || item.paidToppings.length > 0) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.freeToppings.map(t => (
                              <span key={t} className="bg-purple-100 text-[#581C5C] text-[9px] px-1.5 py-0.2 rounded">
                                {t}
                              </span>
                            ))}
                            {item.paidToppings.map(t => (
                              <span key={t.name} className="bg-amber-100 text-amber-900 text-[9px] px-1.5 py-0.2 rounded font-black">
                                +{t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Remove item completely */}
                      <button
                        onClick={() => handleRemoveFromCart(item.cartId)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Bottom quantity toggles & single total price */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200/50 text-xs">
                      <div className="flex items-center space-x-3 bg-white rounded-full border border-gray-200 px-2.5 py-0.5">
                        <button
                          onClick={() => handleUpdateCartQty(item.cartId, -1)}
                          className="text-gray-500 p-0.5 hover:text-red-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateCartQty(item.cartId, 1)}
                          className="text-gray-500 p-0.5 hover:text-green-500"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="font-black text-sm text-[#581C5C]">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Cart subtotal and checkout step trigger */}
            {cart.length > 0 && (
              <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-3 flex-shrink-0">
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold">R$ {getCartSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Entrega:</span>
                    <span className="font-bold text-green-700">A partir de R$ 5,00 (Grátis acima de R$ 50)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="border border-gray-300 hover:bg-gray-100 font-bold py-2.5 rounded-full text-xs text-center"
                  >
                    Mais produtos
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="bg-[#581C5C] hover:bg-[#F49D06] text-white hover:text-[#581C5C] font-black py-2.5 rounded-full text-xs text-center shadow-lg flex items-center justify-center space-x-1"
                  >
                    <span>Fazer Pedido</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 8. SIMPLIFIED DELIVERY CHECKOUT MODAL (OlaClick WhatsApp layout) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#581C5C] text-white p-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-yellow-300" />
                <h3 className="font-black text-base uppercase">Enviar Pedido</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="bg-purple-950 p-1.5 rounded-full hover:bg-red-600 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Check out state rendering */}
            {!createdOrderCode ? (
              <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                
                {/* Mode Selector */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-black uppercase text-gray-400 tracking-wider">Como deseja receber?</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("delivery")}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center space-x-2 transition-all ${
                        deliveryMethod === "delivery"
                          ? "border-[#581C5C] bg-purple-50 text-[#581C5C] font-black"
                          : "border-gray-200 bg-white text-gray-700 text-xs"
                      }`}
                    >
                      <Truck className="h-4 w-4" />
                      <span className="text-xs">Entrega (+R$ 5,00)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("pickup")}
                      className={`p-3 rounded-xl border-2 flex items-center justify-center space-x-2 transition-all ${
                        deliveryMethod === "pickup"
                          ? "border-[#581C5C] bg-purple-50 text-[#581C5C] font-black"
                          : "border-gray-200 bg-white text-gray-700 text-xs"
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">Retirar no Balcão</span>
                    </button>
                  </div>
                </div>

                {/* Name & phone */}
                <div className="space-y-3">
                  <span className="block text-[11px] font-black uppercase text-gray-400 tracking-wider">Seus Dados</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold mb-1">Qual o seu nome?</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Amanda Silva"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581C5C] text-xs bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold mb-1">Telefone WhatsApp:</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: (11) 98765-4321"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581C5C] text-xs bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery fields */}
                {deliveryMethod === "delivery" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
                    <span className="block text-[11px] font-black uppercase text-gray-400 tracking-wider">Endereço de Entrega</span>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] text-gray-500 font-bold mb-1">Rua, número e complemento:</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Av. das Oliveiras, 1420 - Bloco C Apto 23"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581C5C] text-xs bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 font-bold mb-1">Bairro / Cidade:</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Jardim Paulista - São Paulo"
                          value={customerCity}
                          onChange={(e) => setCustomerCity(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#581C5C] text-xs bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                <div className="space-y-3">
                  <span className="block text-[11px] font-black uppercase text-gray-400 tracking-wider">Como vai pagar?</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "pix", label: "Pix", emoji: "📱" },
                      { id: "card", label: "Cartão", emoji: "💳" },
                      { id: "cash", label: "Dinheiro", emoji: "💵" }
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-2 rounded-xl border-2 text-center transition-all ${
                          paymentMethod === pm.id
                            ? "border-[#581C5C] bg-purple-50 text-[#581C5C] font-bold"
                            : "border-gray-200 bg-white text-gray-700 hover:border-purple-200"
                        }`}
                      >
                        <span className="text-base block">{pm.emoji}</span>
                        <span className="text-[10px] block font-bold">{pm.label}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "cash" && (
                    <div className="pt-2 animate-in fade-in duration-200">
                      <label className="block text-[10px] text-gray-500 font-bold mb-1">Precisa de troco para quanto?</label>
                      <input
                        type="text"
                        placeholder="Ex: R$ 50 ou R$ 100"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        className="w-32 p-2 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Total Account overview */}
                <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-yellow-600/10 space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span>Açaís e Sobremesas:</span>
                    <span className="font-bold text-[#2D0B2E]">R$ {getCartSubtotal().toFixed(2)}</span>
                  </div>
                  {deliveryMethod === "delivery" && (
                    <div className="flex justify-between">
                      <span>Taxa de Entrega:</span>
                      <span className="font-bold text-green-700">
                        {getDeliveryFee() === 0 ? "GRÁTIS ✨" : `R$ ${getDeliveryFee().toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-purple-500/10 text-[#581C5C]">
                    <span>Total do Pedido:</span>
                    <span>R$ {getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="flex-1 border border-gray-300 hover:bg-gray-100 font-bold py-3 rounded-full text-xs text-center text-gray-600"
                  >
                    Voltar à cesta
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="flex-1 bg-[#581C5C] hover:bg-[#F49D06] text-white hover:text-[#581C5C] font-black py-3 rounded-full text-xs shadow-lg transition-all flex items-center justify-center space-x-1"
                  >
                    <span>{isSubmittingOrder ? "Gravando..." : "Confirmar Pedido 💜"}</span>
                  </button>
                </div>

              </form>
            ) : (
              // Order placement success -> WhatsApp redirection
              <div className="p-6 text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="h-10 w-12" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-green-700">Seu Pedido foi Registrado!</h3>
                  <p className="text-xs text-gray-500">
                    Obrigado {customerName}! Agora só falta o último passo: Enviar os dados formatados diretamente no WhatsApp da loja para agilizar sua preparação.
                  </p>
                  <div className="bg-[#FAF6EE] p-3 rounded-xl border border-yellow-600/10 inline-block font-mono text-[#581C5C] font-black text-base">
                    Pedido: {createdOrderCode}
                  </div>
                </div>

                <button
                  onClick={handleSendWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-full text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>ENVIAR PEDIDO COMPLETO NO WHATSAPP</span>
                </button>

                <p className="text-[10px] text-gray-400 italic">
                  *Ao clicar, você será redirecionado para o WhatsApp da D'Gust Açaí com sua mensagem pronta!
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 9. BOTTOM DESCRIPTIVE INFO & CREDIT */}
      <footer className="bg-[#331135] text-purple-100 mt-16 py-12 border-t-4 border-[#F49D06]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6 text-xs">
          
          <h2 className="text-xl font-black tracking-tight text-white flex items-center justify-center">
            D'Gust <span className="text-[#F49D06] ml-2">Açaí</span>
          </h2>
          
          <p className="leading-relaxed text-purple-200">
            A sua parada favorita para saborear o açaí mais incrível e cremoso! Feito do seu jeito, para todas as idades, com ingredientes selecionados e muito amor. 
          </p>

          <div className="bg-[#240626] p-4 rounded-2xl border border-purple-900 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-semibold text-yellow-300">
            <span>🕒 Ter a Dom: 13:00 às 22:30</span>
            <span className="hidden sm:inline">•</span>
            <span>📍 Av. Principal do Açaí, 500, SP</span>
            <span className="hidden sm:inline">•</span>
            <span>📞 (11) 99999-9999</span>
          </div>

          <p className="text-purple-400 text-[10px] pt-4">
            © {new Date().getFullYear()} D'Gust Açaí. Desenvolvido com carinho para os amantes de Açaí. Todos os direitos reservados.
          </p>

        </div>
      </footer>

    </div>
  );
}
