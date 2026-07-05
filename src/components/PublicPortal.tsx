import React, { useState } from "react";
import { Offer, BotSettings } from "../types";
import { Search, Sparkles, Star, Tag, ShoppingBag, Bell, ExternalLink } from "lucide-react";
import PushNotificationManager from "./PushNotificationManager";

interface PublicPortalProps {
  offers: Offer[];
  settings: BotSettings;
}

export default function PublicPortal({ offers, settings }: PublicPortalProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "discount" | "relevance">("newest");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCoupon = (e: React.MouseEvent, code: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Only show sent offers in the public directory
  const sentOffers = offers.filter((o) => o.status === "sent");

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleRedirectClick = (id: string) => {
    // Open redirect link in new tab
    window.open(`/r/${id}`, "_blank");
    // Reload state after a short delay so the click count updates on dashboard
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("offers-updated"));
    }, 1500);
  };

  // Filter and Sort Offers
  const filteredOffers = sentOffers
    .filter((offer) => {
      const matchesCategory = selectedCategory === "all" || offer.category === selectedCategory;
      const matchesSearch =
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.store.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "discount") {
        return (b.discountPercent || 0) - (a.discountPercent || 0);
      }
      if (sortBy === "relevance") {
        return b.relevance - a.relevance;
      }
      // default: newest first
      return new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime();
    });

  return (
    <div id="public-portal-root" className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Header */}
      <div className="glass rounded-3xl p-8 sm:p-10 text-white text-center relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-550/5 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>

        <div className="relative max-w-xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" /> Os Melhores Achadinhos da Internet
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-transparent">
            Economize em Tempo Real com Links de Afiliados
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Nossa curadoria inteligente filtra promoções históricas e gera cupons automáticos para você comprar barato com total segurança.
          </p>
        </div>
      </div>

      {/* Real-time Browser Push Notifications Module */}
      <PushNotificationManager />

      {/* Filters, Categories and Search row */}
      <div className="space-y-4">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none scroll-smooth">
          <button
            type="button"
            onClick={() => handleCategorySelect("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white border border-indigo-500/20 shadow-lg shadow-indigo-500/20"
                : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            🔥 Ver Tudo ({sentOffers.length})
          </button>
          {settings.categories.map((cat) => {
            const count = sentOffers.filter((o) => o.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white border border-indigo-500/20 shadow-lg shadow-indigo-500/20"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 left-3.5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar ofertas ativas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-400">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-semibold"
            >
              <option value="newest" className="bg-slate-900 text-white">Mais Recentes</option>
              <option value="discount" className="bg-slate-900 text-white">Maior Desconto</option>
              <option value="relevance" className="bg-slate-900 text-white">Maior Relevância</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Active Deals */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-16 text-slate-300 space-y-3 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
          <ShoppingBag className="w-10 h-10 text-slate-450 mx-auto" />
          <p className="text-sm font-semibold text-white">Nenhuma promoção ativa no momento.</p>
          <p className="text-xs max-w-xs mx-auto">
            Por favor, mude para a visão do "Painel do Administrador" para escanear e enviar novas ofertas!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`glass rounded-2xl border shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                offer.type === "coupon"
                  ? "border-amber-500/20 hover:border-amber-500/40"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Card top banner / category */}
              <div className="h-32 bg-white/[0.02] relative flex items-center justify-center p-4 border-b border-white/10 overflow-hidden">
                {offer.imageUrl && offer.imageUrl.trim() !== "" ? (
                  <img
                    src={offer.imageUrl.trim()}
                    alt={offer.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500"
                  />
                ) : null}
                <div className="absolute inset-0 bg-slate-950/20" />
                
                {/* Store Label Badge */}
                <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs ${
                  offer.store === "Amazon"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : offer.store === "Shopee"
                    ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                    : offer.store === "Mercado Livre"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                }`}>
                  {offer.store}
                </span>

                {/* Relevance rating badge */}
                <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-slate-950/80 text-white px-2.5 py-1 border border-white/10 rounded-full flex items-center gap-1 shadow-2xs backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  {offer.relevance}/10
                </span>

                {/* Category Icon Accents */}
                <span className="text-4xl transition-all duration-300 group-hover:scale-110">
                  {offer.type === "coupon"
                    ? "🎫"
                    : offer.category === "Eletrônicos"
                    ? "💻"
                    : offer.category === "Moda"
                    ? "👕"
                    : offer.category === "Casa & Cozinha"
                    ? "🍳"
                    : offer.category === "Livros"
                    ? "📚"
                    : offer.category === "Games"
                    ? "🎮"
                    : offer.category === "Beleza" || offer.category === "Beleza & Cuidado"
                    ? "💄"
                    : "🏷️"}
                </span>

                {offer.discountPercent && (
                  <span className="absolute -bottom-2.5 left-4 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-2xs border border-emerald-400/20">
                    {offer.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Card body details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4 bg-slate-900/10">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {offer.type === "coupon"
                      ? "🎟️ Cupom de Desconto"
                      : offer.type === "discount_product"
                      ? "🏷️ Produto em Oferta"
                      : offer.category}
                  </span>
                  <h3 className="font-display font-bold text-white text-xs line-clamp-2 leading-snug">
                    {offer.title}
                  </h3>
                </div>

                {/* Price & Action Display */}
                {offer.type === "coupon" ? (
                  <div className="space-y-2">
                    {offer.couponCode && (
                      <div
                        onClick={(e) => handleCopyCoupon(e, offer.couponCode || "", offer.id)}
                        className="bg-amber-500/10 border border-dashed border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between gap-1.5 cursor-pointer hover:bg-amber-500/15 transition-all"
                        title="Clique para copiar o cupom"
                      >
                        <div className="text-left">
                          <span className="text-[8px] font-bold text-amber-300 uppercase block leading-none">🎟️ Código Cupom</span>
                          <span className="font-mono font-black text-xs text-white tracking-wider mt-1 block">{offer.couponCode}</span>
                        </div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-1 rounded">
                          {copiedId === offer.id ? "Copiado!" : "Copiar"}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRedirectClick(offer.id)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Pegar Cupom & Ir ao Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-slate-300">Por</span>
                      <span className="text-lg font-display font-black text-white">
                        R$ {offer.price.toFixed(2)}
                      </span>
                      {offer.originalPrice && (
                        <span className="text-[11px] text-slate-400 line-through">
                          R$ {offer.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRedirectClick(offer.id)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Pegar Promoção</span>
                      <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
