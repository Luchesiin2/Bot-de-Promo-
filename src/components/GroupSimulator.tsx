import React, { useState, useEffect, useRef } from "react";
import { Offer } from "../types";
import { Send, Smartphone, MessageCircle, MessageSquare, Shield, Clock, Users, ArrowRight } from "lucide-react";

interface GroupSimulatorProps {
  offers: Offer[];
}

export default function GroupSimulator({ offers }: GroupSimulatorProps) {
  const [activeChannel, setActiveChannel] = useState<"telegram" | "whatsapp">("telegram");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter offers that are sent
  const sentOffers = offers
    .filter((o) => o.status === "sent" && o.channels.includes(activeChannel))
    .sort((a, b) => new Date(a.sentAt || a.createdAt).getTime() - new Date(b.sentAt || b.createdAt).getTime());

  useEffect(() => {
    // Scroll to bottom of simulator when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sentOffers, activeChannel]);

  return (
    <div id="group-simulator" className="flex flex-col items-center">
      {/* Selector pills */}
      <div className="flex gap-2 p-1 glass border border-white/10 rounded-xl mb-4 w-full max-w-sm">
        <button
          type="button"
          onClick={() => setActiveChannel("telegram")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeChannel === "telegram"
              ? "bg-sky-500/80 border border-sky-400/30 text-white shadow-lg"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <Send className="w-3.5 h-3.5" /> Telegram Preview
        </button>
        <button
          type="button"
          onClick={() => setActiveChannel("whatsapp")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeChannel === "whatsapp"
              ? "bg-emerald-600/80 border border-emerald-500/30 text-white shadow-lg"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Preview
        </button>
      </div>

      {/* Smartphone Container Mockup */}
      <div className="relative mx-auto border-12 border-slate-900 rounded-[40px] h-[640px] w-full max-w-[340px] shadow-2xl overflow-hidden bg-slate-950 flex flex-col">
        {/* Notch / Speaker */}
        <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 flex justify-center items-center z-20">
          <div className="w-24 h-4 bg-black rounded-b-xl flex items-center justify-between px-3">
            <span className="w-2 h-2 rounded-full bg-slate-800"></span>
            <span className="w-10 h-1 bg-slate-800 rounded-full"></span>
          </div>
        </div>

        {/* Channel Chat Interface */}
        {activeChannel === "telegram" ? (
          // Telegram Chat layout
          <div className="flex-1 flex flex-col pt-6 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/40 via-slate-900 to-slate-950 text-white text-xs select-none">
            {/* Header */}
            <div className="bg-slate-900/90 backdrop-blur-md border-b border-sky-950 px-4 py-2 flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white font-display text-sm shadow-xs">
                🔥
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 flex items-center gap-1">
                  Achadinhos Imperdíveis
                  <Shield className="w-3 h-3 text-sky-400 fill-sky-400/20" />
                </h4>
                <p className="text-[10px] text-sky-400 font-medium">14.390 inscritos • canal público</p>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 dark-scroll flex flex-col">
              {sentOffers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2">
                  <Clock className="w-8 h-8 text-slate-700 animate-pulse" />
                  <p className="text-[11px] max-w-[200px]">
                    Nenhuma oferta enviada para o Telegram hoje. Publique uma oferta com a IA para ver o feed atualizar em tempo real!
                  </p>
                </div>
              ) : (
                sentOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="self-center bg-slate-900/95 border border-sky-950/50 rounded-2xl p-3 shadow-md w-full max-w-[280px] space-y-2 animate-slideUp"
                  >
                    {/* Offer Image Simulation/Placeholder */}
                    <div className="h-28 bg-slate-850 rounded-xl overflow-hidden relative flex items-center justify-center border border-slate-800">
                      <div className="absolute top-2 left-2 bg-sky-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {offer.store}
                      </div>
                      <div className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        ⭐ {offer.relevance}/10
                      </div>
                      <span className="text-3xl">
                        {offer.category === "Eletrônicos" ? "💻" : offer.category === "Moda" ? "👕" : offer.category === "Casa & Cozinha" ? "🍳" : offer.category === "Livros" ? "📚" : offer.category === "Games" ? "🎮" : offer.category === "Beleza" ? "💄" : "🏷️"}
                      </span>
                    </div>

                    {/* Offer content formatted */}
                    <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-wrap text-[11px]">
                      {offer.description.replace("[LINK_AFILIADO]", offer.affiliateUrl)}
                    </p>

                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-500">
                      <span>👁️ 2.4K</span>
                      <span>{new Date(offer.sentAt || offer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Bar */}
            <div className="bg-slate-900/95 border-t border-slate-800 py-2.5 px-4 text-center text-sky-400 font-semibold cursor-pointer select-none shrink-0 text-[11px]">
              SILENCIAR CANAL
            </div>
          </div>
        ) : (
          // WhatsApp Chat layout
          <div className="flex-1 flex flex-col pt-6 h-full bg-[#0b141a] text-slate-200 text-xs select-none">
            {/* Header */}
            <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white font-display text-base shadow-xs">
                💬
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-100 truncate">Grupo de Ofertas & Descontos 💸</h4>
                <p className="text-[9px] text-emerald-400 font-medium truncate">Você, Marcos, Ana, +452 participantes</p>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 dark-scroll flex flex-col">
              {sentOffers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-600 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-800 animate-pulse" />
                  <p className="text-[11px] max-w-[200px]">
                    Nenhuma oferta enviada para o WhatsApp hoje. Publique uma oferta com a IA para ver o feed atualizar em tempo real!
                  </p>
                </div>
              ) : (
                sentOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="self-start bg-[#202c33] rounded-xl rounded-tl-none p-2.5 shadow-xs w-full max-w-[260px] space-y-1.5 relative border border-slate-800/20 animate-slideUp"
                  >
                    {/* User identifier inside group */}
                    <span className="text-[10px] font-semibold text-emerald-400 block">
                      ~ PromoLink Bot 🤖
                    </span>

                    {/* Message content */}
                    <p className="text-slate-100 leading-relaxed font-sans whitespace-pre-wrap text-[11px]">
                      {offer.description.replace("[LINK_AFILIADO]", offer.affiliateUrl)}
                    </p>

                    <span className="text-[9px] text-slate-400 absolute bottom-1 right-2 block">
                      {new Date(offer.sentAt || offer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Simulator bar */}
            <div className="bg-[#1f2c34] p-2 flex items-center gap-2 shrink-0 border-t border-slate-800/40">
              <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[10px] text-slate-400">
                Apenas administradores podem enviar mensagens
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
