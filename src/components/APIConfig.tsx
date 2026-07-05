import React, { useState, useEffect } from "react";
import { BotSettings } from "../types";
import { Send, Check, Settings, ShieldAlert, Key, MessageSquare, Info, Award, HelpCircle } from "lucide-react";

interface APIConfigProps {
  settings: BotSettings;
  onSaveSettings: (settings: BotSettings) => Promise<boolean>;
}

export default function APIConfig({ settings, onSaveSettings }: APIConfigProps) {
  const [localSettings, setLocalSettings] = useState<BotSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"telegram" | "whatsapp" | "affiliate">("telegram");

  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("newCategory") as HTMLInputElement;
    if (input && input.value.trim() && !localSettings.categories.includes(input.value.trim())) {
      setLocalSettings((prev) => ({
        ...prev,
        categories: [...prev.categories, input.value.trim()],
      }));
      input.value = "";
    }
  };

  const removeCategory = (cat: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await onSaveSettings(localSettings);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div id="api-config-container" className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/40 border-b border-white/10 px-6 py-6 text-white flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Configurações do Sistema & APIs
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            Conecte suas contas de afiliado e configure as credenciais automatizadas de envio.
          </p>
        </div>
        {saveSuccess && (
          <div className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
            <Check className="w-3.5 h-3.5" /> Salvo com sucesso!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-white/[0.02]">
        <button
          type="button"
          onClick={() => setActiveTab("telegram")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === "telegram"
              ? "border-indigo-400 text-indigo-400 bg-white/[0.05]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Send className="w-4 h-4" /> Telegram Bot
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === "whatsapp"
              ? "border-indigo-400 text-indigo-400 bg-white/[0.05]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> WhatsApp Gateway
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("affiliate")}
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === "affiliate"
              ? "border-indigo-400 text-indigo-400 bg-white/[0.05]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" /> IDs de Afiliado
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {activeTab === "telegram" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-200 text-xs flex gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <strong className="font-semibold block mb-0.5 text-white">Como obter essas credenciais?</strong>
                <ol className="list-decimal pl-4 space-y-1 mt-1 text-indigo-300">
                  <li>Inicie uma conversa com o <strong>@BotFather</strong> no Telegram.</li>
                  <li>Envie o comando <code>/newbot</code> e siga as etapas para criar o seu robô.</li>
                  <li>Copie o <strong>Token de API</strong> fornecido e cole abaixo.</li>
                  <li>Adicione seu bot como <strong>Administrador</strong> do canal ou grupo onde as ofertas serão postadas.</li>
                  <li>Pegue o ID do Chat (ex: <code>-10012345678</code>) usando bots de ID como o <code>@RawDataBot</code>.</li>
                </ol>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Token do Bot (Telegram Token)
                </label>
                <input
                  type="password"
                  name="telegramToken"
                  value={localSettings.telegramToken}
                  onChange={handleChange}
                  placeholder="Ex: 5849301293:AAEiX93..."
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-indigo-400" />
                  ID do Chat / Canal (Telegram Chat ID)
                </label>
                <input
                  type="text"
                  name="telegramChatId"
                  value={localSettings.telegramChatId}
                  onChange={handleChange}
                  placeholder="Ex: -100158392810"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Note: Se as credenciais forem deixadas em branco, os envios rodarão em modo de simulação interativa na tela.
            </p>
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-200 text-xs flex gap-3">
              <Info className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="font-semibold block mb-0.5 text-white">Integração do WhatsApp Webhook</strong>
                <p className="text-emerald-300 mt-1 leading-relaxed">
                  Conecte nosso disparador a APIs externas (como Evolution API, Baileys, Z-API, ou Twilio). 
                  Quando disparada, a nossa API enviará um POST no formato JSON contendo o campo <code>message</code> e o <code>number</code> do grupo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5">
                  URL do Webhook / Endpoint
                </label>
                <input
                  type="url"
                  name="whatsappWebhookUrl"
                  value={localSettings.whatsappWebhookUrl}
                  onChange={handleChange}
                  placeholder="Ex: https://sua-api-whatsapp.com/message/send"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5">
                  Token / API Key (Se houver)
                </label>
                <input
                  type="password"
                  name="whatsappApiKey"
                  value={localSettings.whatsappApiKey}
                  onChange={handleChange}
                  placeholder="Bearer token ou API Key"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5">
                Identificador do Grupo / JID do Destinatário
              </label>
              <input
                type="text"
                name="whatsappGroupJid"
                value={localSettings.whatsappGroupJid}
                onChange={handleChange}
                placeholder="Ex: 120363028391039@g.us (JID do grupo) ou número com DDI"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === "affiliate" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-200 text-xs flex gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <strong className="font-semibold block mb-0.5 text-white">Como funciona a injeção de links de afiliado?</strong>
                <p className="text-indigo-300 mt-1 leading-relaxed">
                  Nosso motor inteligente analisa a URL do produto escaneado. Ao identificar uma URL da Amazon ou da Shopee, 
                  ele automaticamente reformata os links injetando o seu respectivo ID de parceiro listado abaixo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Amazon Associate ID (tag)
                </label>
                <input
                  type="text"
                  name="amazonAssociateId"
                  value={localSettings.amazonAssociateId}
                  onChange={handleChange}
                  placeholder="Ex: seuid-20"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  Shopee SubID
                </label>
                <input
                  type="text"
                  name="shopeeSubId"
                  value={localSettings.shopeeSubId}
                  onChange={handleChange}
                  placeholder="Ex: afiliadogrupo1"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                Sufixo do Link de Redirecionamento Local
              </label>
              <input
                type="text"
                name="generalRedirectPrefix"
                value={localSettings.generalRedirectPrefix}
                onChange={handleChange}
                placeholder="Ex: /r/"
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-mono"
              />
              <p className="text-[11px] text-slate-300 mt-1">
                Todas as ofertas criarão um link intermediário como <code>sua-url.com/r/offer-id</code> para registrar estatísticas de cliques antes de enviar o comprador para o link afiliado.
              </p>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-300">
            * Altere as abas para preencher todos os campos necessários.
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </button>
        </div>
      </form>

      {/* Categories block in separate section for cleanliness */}
      <div className="border-t border-white/10 p-6 bg-white/[0.02]">
        <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-3">
          Categorias de Ofertas Cadastradas
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {localSettings.categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-white text-xs font-medium rounded-full shadow-2xs"
            >
              {cat}
              <button
                type="button"
                onClick={() => removeCategory(cat)}
                className="w-4 h-4 rounded-full hover:bg-white/10 text-slate-300 hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleCategoryChange} className="flex gap-2 max-w-md">
          <input
            type="text"
            name="newCategory"
            placeholder="Adicionar nova categoria..."
            className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
