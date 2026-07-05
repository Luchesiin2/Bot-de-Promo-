import React, { useState, useEffect } from "react";
import { Offer, BotSettings, DashboardStats } from "./types";
import AdminDashboard from "./components/AdminDashboard";
import LinkManager from "./components/LinkManager";
import CouponManager from "./components/CouponManager";
import APIConfig from "./components/APIConfig";
import GroupSimulator from "./components/GroupSimulator";
import PublicPortal from "./components/PublicPortal";
import { Sparkles, BarChart2, Link, Smartphone, Settings, ShieldAlert, Monitor, Eye, RefreshCw, RefreshCcw, Ticket } from "lucide-react";

export default function App() {
  const [viewMode, setViewMode] = useState<"admin" | "public">("admin");
  const [activeAdminTab, setActiveAdminTab] = useState<"dashboard" | "links" | "coupons" | "api" | "simulator">("dashboard");
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<BotSettings>({
    telegramToken: "",
    telegramChatId: "",
    whatsappWebhookUrl: "",
    whatsappApiKey: "",
    whatsappGroupJid: "",
    amazonAssociateId: "seutag-20",
    shopeeSubId: "afiliado123",
    generalRedirectPrefix: "/r/",
    categories: ["Eletrônicos", "Moda", "Casa & Cozinha", "Livros", "Games", "Beleza & Cuidado", "Supermercado", "Outros"]
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalClicks: 0,
    totalOffers: 0,
    sentOffers: 0,
    clicksByCategory: [],
    clicksByStore: [],
    clicksOverTime: []
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Load all application data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [offersRes, settingsRes, statsRes] = await Promise.all([
        fetch("/api/offers"),
        fetch("/api/settings"),
        fetch("/api/stats")
      ]);

      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData);
      }
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (e) {
      console.error("Error loading full application state:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Event listener for reloading data after changes (e.g. from subcomponents)
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("offers-updated", handleUpdate);
    return () => window.removeEventListener("offers-updated", handleUpdate);
  }, []);

  const handleSaveSettings = async (newSettings: BotSettings): Promise<boolean> => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      if (response.ok) {
        setSettings(newSettings);
        // Refresh statistics as categories or details might change
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        return true;
      }
    } catch (e) {
      console.error("Error saving settings:", e);
    }
    return false;
  };

  const handleAddOffer = async (offerData: Partial<Offer>): Promise<boolean> => {
    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerData)
      });
      if (response.ok) {
        await loadData();
        return true;
      }
    } catch (e) {
      console.error("Error creating/editing offer:", e);
    }
    return false;
  };

  const handleDeleteOffer = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        await loadData();
        return true;
      }
    } catch (e) {
      console.error("Error deleting offer:", e);
    }
    return false;
  };

  const handleSendMessage = async (id: string, channels: ('telegram' | 'whatsapp')[]): Promise<boolean> => {
    try {
      const response = await fetch(`/api/send-message/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels })
      });
      if (response.ok) {
        const data = await response.json();
        await loadData();

        // Trigger custom simulated push notification to the public screen
        const textToSend = data.offer.description.replace("[LINK_AFILIADO]", data.offer.affiliateUrl);
        const event = new CustomEvent("simulated-push-notification", {
          detail: {
            id: data.offer.id,
            title: `Nova Oferta: ${data.offer.title} 🛍️`,
            body: `Disponível na loja ${data.offer.store} por apenas R$ ${data.offer.price.toFixed(2)}! Clique para garantir.`,
            store: data.offer.store
          }
        });
        window.dispatchEvent(event);

        return true;
      }
    } catch (e) {
      console.error("Error firing message delivery:", e);
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none antialiased text-slate-100 pb-16 relative">
      <div className="mesh-bg" />
      
      {/* Top Navigation Bar */}
      <header className="glass sticky top-0 z-30 shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 fill-white/10" />
            </div>
            <div>
              <h1 className="font-display font-black text-[15px] sm:text-base text-white tracking-tight leading-none">
                AffiliFlow Pro
              </h1>
              <p className="text-[10px] text-indigo-300 font-medium tracking-wide mt-0.5 uppercase">
                Automação de Ofertas
              </p>
            </div>
          </div>

          {/* View Mode Switcher segmented controller */}
          <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1.5 border border-white/10">
            <button
              onClick={() => setViewMode("admin")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "admin"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Painel Admin
            </button>
            <button
              onClick={() => setViewMode("public")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "public"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Portal de Ofertas
            </button>
          </div>

          {/* Sync status */}
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
        </div>
      </header>

      {/* Main Content body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full relative z-10">
        {isLoading && offers.length === 0 ? (
          // Beautiful full screen loader
          <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
            <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider animate-pulse">
              Carregando dados do sistema...
            </p>
          </div>
        ) : viewMode === "public" ? (
          // Public-facing View
          <PublicPortal offers={offers} settings={settings} />
        ) : (
          // Admin Panel View with sidebar structure
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Admin Sidebar options */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass rounded-2xl p-4 space-y-1.5 shadow-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-2">
                  Gerenciador de Ofertas
                </span>
                
                <button
                  onClick={() => setActiveAdminTab("dashboard")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                    activeAdminTab === "dashboard"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <BarChart2 className="w-4 h-4 shrink-0" />
                  Painel de Estatísticas
                </button>

                <button
                  onClick={() => setActiveAdminTab("links")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                    activeAdminTab === "links"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Link className="w-4 h-4 shrink-0" />
                  Gerenciar Links
                </button>

                <button
                  onClick={() => setActiveAdminTab("coupons")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                    activeAdminTab === "coupons"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Ticket className="w-4 h-4 shrink-0" />
                  Cupons & Descontos
                </button>

                <button
                  onClick={() => setActiveAdminTab("simulator")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                    activeAdminTab === "simulator"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  Simulador de Canais
                </button>

                <button
                  onClick={() => setActiveAdminTab("api")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                    activeAdminTab === "api"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  Ajustes APIs & IDs
                </button>
              </div>

              {/* Tips card */}
              <div className="glass border border-indigo-500/20 rounded-2xl p-4.5 space-y-1.5 bg-indigo-500/10">
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" /> Rastreamento Ativo
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Os cliques realizados no <strong>Portal de Ofertas</strong> atualizam instantaneamente as estatísticas e gráficos do Painel Admin! Use a aba para simular a visão do usuário final.
                </p>
              </div>
            </div>

            {/* Admin Center panel viewport (Left 3 cols) */}
            <div className="lg:col-span-3">
              {activeAdminTab === "dashboard" && (
                <AdminDashboard stats={stats} offers={offers} onRefresh={loadData} />
              )}
              {activeAdminTab === "links" && (
                <LinkManager offers={offers} onDeleteOffer={handleDeleteOffer} onSendMessage={handleSendMessage} />
              )}
              {activeAdminTab === "coupons" && (
                <CouponManager
                  settings={settings}
                  offers={offers}
                  onAddOffer={handleAddOffer}
                  onSendMessage={handleSendMessage}
                  onDeleteOffer={handleDeleteOffer}
                />
              )}
              {activeAdminTab === "simulator" && (
                <div className="glass rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="space-y-1">
                    <h2 className="font-display text-lg font-bold text-white">
                      Simulação ao Vivo dos Disparos
                    </h2>
                    <p className="text-xs text-slate-400">
                      Veja exatamente como os textos de afiliados estruturados chegam nos celulares dos seus inscritos.
                    </p>
                  </div>
                  <GroupSimulator offers={offers} />
                </div>
              )}
              {activeAdminTab === "api" && (
                <APIConfig settings={settings} onSaveSettings={handleSaveSettings} />
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
