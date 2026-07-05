import React, { useState } from "react";
import { Offer } from "../types";
import { Trash2, Send, ExternalLink, Calendar, CheckCircle, AlertCircle, RefreshCw, BarChart2, Star } from "lucide-react";

interface LinkManagerProps {
  offers: Offer[];
  onDeleteOffer: (id: string) => Promise<boolean>;
  onSendMessage: (id: string, channels: ('telegram' | 'whatsapp')[]) => Promise<boolean>;
}

export default function LinkManager({ offers, onDeleteOffer, onSendMessage }: LinkManagerProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "sent">("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta oferta?")) {
      await onDeleteOffer(id);
    }
  };

  const handleSendNow = async (id: string, channels: ('telegram' | 'whatsapp')[]) => {
    setIsProcessingId(id);
    await onSendMessage(id, channels);
    setIsProcessingId(null);
  };

  // Extract unique stores for filtering
  const uniqueStores = ["all", ...Array.from(new Set(offers.map((o) => o.store))).filter(Boolean)];

  // Apply filters
  const filteredOffers = offers.filter((offer) => {
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
    const matchesStore = storeFilter === "all" || offer.store === storeFilter;
    const matchesSearch =
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.store.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesStore && matchesSearch;
  });

  return (
    <div id="link-manager-container" className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      {/* Header and filters */}
      <div className="p-6 border-b border-white/10 bg-white/[0.02]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Gerenciar Links & Publicações
            </h2>
            <p className="text-slate-300 text-xs mt-0.5">
              Visualize, filtre, envie para redes sociais ou apague ofertas estruturadas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-500/20"
                  : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              Todos ({offers.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("sent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "sent"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-500/20"
                  : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              Enviados ({offers.filter((o) => o.status === "sent").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "draft"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-500/20"
                  : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              Rascunhos ({offers.filter((o) => o.status === "draft").length})
            </button>
          </div>
        </div>

        {/* Search and store selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <input
            type="text"
            placeholder="Buscar por título, categoria, loja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:col-span-2 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
          />

          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-semibold"
          >
            <option value="all" className="bg-slate-900 text-white">Todas as Lojas</option>
            {uniqueStores.filter(st => st !== "all").map((st) => (
              <option key={st} value={st} className="bg-slate-900 text-white">
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of link cards */}
      <div className="p-6">
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12 text-slate-300 space-y-2 border border-dashed border-white/10 bg-white/[0.02] rounded-2xl">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-medium">Nenhuma oferta encontrada.</p>
            <p className="text-xs max-w-sm mx-auto">
              Tente redefinir seus filtros ou cadastre cupons e ofertas na aba "Cupons & Descontos".
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  offer.status === "sent"
                    ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/20"
                    : "bg-amber-500/[0.03] border-amber-500/20 hover:bg-amber-500/[0.05] hover:border-amber-500/30"
                }`}
              >
                {/* Details info */}
                <div className="flex-1 flex gap-4 items-start">
                  {offer.imageUrl && offer.imageUrl.trim() !== "" ? (
                    <div className="w-14 h-14 rounded-lg border border-white/10 bg-slate-950/40 overflow-hidden shrink-0 mt-1">
                      <img
                        src={offer.imageUrl.trim()}
                        alt={offer.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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

                      <span className="text-[10px] font-medium bg-white/5 text-slate-300 border border-white/5 px-2 py-0.5 rounded-full">
                        {offer.category}
                      </span>

                      <span className="text-[10px] font-semibold text-indigo-300 flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        RELEVÂNCIA: {offer.relevance}/10
                      </span>

                      {offer.status === "sent" ? (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> ENVIADO
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 border border-amber-500/20 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3 animate-pulse" /> RASCUNHO
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-white text-sm leading-snug">
                      {offer.title}
                    </h3>

                    <div className="flex items-center gap-3.5 text-xs text-slate-300">
                      <span className="font-semibold text-white">
                        R$ {offer.price.toFixed(2)}
                        {offer.originalPrice && (
                          <span className="text-[11px] text-slate-400 font-normal line-through ml-1.5">
                            R$ {offer.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </span>
                      {offer.discountPercent && (
                        <span className="text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md text-[10px]">
                          -{offer.discountPercent}% OFF
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <BarChart2 className="w-3.5 h-3.5" /> {offer.clicksCount} Cliques
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions button strip */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href={offer.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                    title="Ver link original"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {offer.status === "draft" ? (
                    <button
                      type="button"
                      onClick={() => handleSendNow(offer.id, ["telegram", "whatsapp"])}
                      disabled={isProcessingId === offer.id}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingId === offer.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Disparar Agora
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendNow(offer.id, ["telegram", "whatsapp"])}
                      disabled={isProcessingId === offer.id}
                      className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      title="Re-enviar oferta aos grupos"
                    >
                      {isProcessingId === offer.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Enviando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" /> Re-disparar
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(offer.id)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition-all cursor-pointer"
                    title="Apagar oferta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
