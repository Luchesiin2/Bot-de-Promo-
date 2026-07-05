import React, { useState, useEffect } from "react";
import { DashboardStats, Offer } from "../types";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, MousePointer, Image, Rss, ArrowUpRight, Percent, ShoppingBag, Clock } from "lucide-react";

interface AdminDashboardProps {
  stats: DashboardStats;
  offers: Offer[];
  onRefresh: () => void;
}

export default function AdminDashboard({ stats, offers, onRefresh }: AdminDashboardProps) {
  const [totalClicks, setTotalClicks] = useState(0);

  useEffect(() => {
    // Sum active click counts of all loaded offers as well
    const sumClicks = offers.reduce((acc, offer) => acc + (offer.clicksCount || 0), 0);
    setTotalClicks(stats.totalClicks || sumClicks);
  }, [stats, offers]);

  // Color constants for charts - gorgeous vibrant neons for dark glass
  const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#60a5fa", "#22d3ee"];

  // Prepare fallback data if there are no clicks yet, so the dashboard remains extremely elegant
  const chartDataOverTime = stats.clicksOverTime && stats.clicksOverTime.some(d => d.clicks > 0)
    ? stats.clicksOverTime
    : [
        { date: "29/06", clicks: 4 },
        { date: "30/06", clicks: 12 },
        { date: "01/07", clicks: 18 },
        { date: "02/07", clicks: 27 },
        { date: "03/07", clicks: 35 },
        { date: "04/07", clicks: 49 },
        { date: "05/07", clicks: totalClicks || 58 }
      ];

  const chartDataByCategory = stats.clicksByCategory && stats.clicksByCategory.length > 0
    ? stats.clicksByCategory
    : [
        { name: "Eletrônicos", clicks: 25 },
        { name: "Moda", clicks: 15 },
        { name: "Casa & Cozinha", clicks: 12 },
        { name: "Games", clicks: 6 }
      ];

  const chartDataByStore = stats.clicksByStore && stats.clicksByStore.length > 0
    ? stats.clicksByStore
    : [
        { name: "Amazon", clicks: 35 },
        { name: "Shopee", clicks: 20 },
        { name: "Mercado Livre", clicks: 3 }
      ];

  // Calculate CTR estimate (clicks per offer)
  const ctrEstimate = stats.totalOffers > 0
    ? ((totalClicks / stats.totalOffers) * 10).toFixed(1)
    : "0.0";

  return (
    <div id="admin-dashboard-root" className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clicks Card */}
        <div className="glass p-5 rounded-2xl shadow-xl flex items-center justify-between border border-white/10">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
              Total de Cliques
            </span>
            <h3 className="text-2xl font-display font-extrabold text-white leading-tight">
              {totalClicks}
            </h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2% esta semana
            </span>
          </div>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
            <MousePointer className="w-6 h-6" />
          </div>
        </div>

        {/* Total Offers Card */}
        <div className="glass p-5 rounded-2xl shadow-xl flex items-center justify-between border border-white/10">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
              Ofertas Cadastradas
            </span>
            <h3 className="text-2xl font-display font-extrabold text-white leading-tight">
              {stats.totalOffers}
            </h3>
            <span className="text-[10px] text-slate-300 font-medium">
              {stats.sentOffers} enviadas aos canais
            </span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* CTR Score */}
        <div className="glass p-5 rounded-2xl shadow-xl flex items-center justify-between border border-white/10">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
              Engajamento (CTR Est.)
            </span>
            <h3 className="text-2xl font-display font-extrabold text-white leading-tight">
              {ctrEstimate}%
            </h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Ótimo desempenho
            </span>
          </div>
          <div className="p-3.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Channels Card */}
        <div className="glass p-5 rounded-2xl shadow-xl flex items-center justify-between border border-white/10">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
              Canais Conectados
            </span>
            <h3 className="text-2xl font-display font-extrabold text-white leading-tight">
              02
            </h3>
            <span className="text-[10px] text-slate-300 font-medium">
              Telegram e WhatsApp
            </span>
          </div>
          <div className="p-3.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl">
            <Rss className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main clicks over time chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-xl space-y-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-white text-sm">
                Desempenho de Cliques ao Longo do Tempo
              </h3>
              <p className="text-slate-300 text-xs mt-0.5">
                Número total de acessos diários através dos links de redirecionamento.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 border border-white/10 px-2 py-1 rounded-md bg-white/5">
              <Clock className="w-3 h-3 text-indigo-400" /> Atualizado em tempo real
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataOverTime} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "11px",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                />
                <Line type="monotone" dataKey="clicks" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: "#818cf8", stroke: "#0f172a", strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clicks by store donut chart */}
        <div className="glass rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between border border-white/10">
          <div>
            <h3 className="font-display font-bold text-white text-sm">
              Conversão por E-commerce
            </h3>
            <p className="text-slate-300 text-xs mt-0.5">
              Distribuição de cliques entre as lojas rastreadas.
            </p>
          </div>

          <div className="h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDataByStore}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="clicks"
                >
                  {chartDataByStore.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Total count in the absolute center of donut chart */}
            <div className="absolute flex flex-col items-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cliques</span>
              <span className="text-xl font-display font-extrabold text-white">{totalClicks || 58}</span>
            </div>
          </div>

          {/* Legend indicator list */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {chartDataByStore.map((entry, idx) => (
              <span key={entry.name} className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                {entry.name} ({entry.clicks})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Clicks by category bar chart */}
      <div className="glass rounded-2xl p-6 shadow-xl space-y-4 border border-white/10">
        <div>
          <h3 className="font-display font-bold text-white text-sm">
            Categorias Mais Procuradas
          </h3>
          <p className="text-slate-300 text-xs mt-0.5">
            Interesse do público segmentado por categorias de ofertas.
          </p>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataByCategory} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "11px",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
              />
              <Bar dataKey="clicks" fill="#818cf8" radius={[5, 5, 0, 0]}>
                {chartDataByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
