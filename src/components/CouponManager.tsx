import React, { useState } from "react";
import { BotSettings, Offer } from "../types";
import { Ticket, Tag, Sparkles, Check, Send, Calendar, AlertCircle, RefreshCw, Percent, ExternalLink, Trash2, Megaphone } from "lucide-react";

interface CouponManagerProps {
  settings: BotSettings;
  offers: Offer[];
  onAddOffer: (offer: Partial<Offer>) => Promise<boolean>;
  onSendMessage: (id: string, channels: ('telegram' | 'whatsapp')[]) => Promise<boolean>;
  onDeleteOffer: (id: string) => Promise<boolean>;
}

export default function CouponManager({ settings, offers, onAddOffer, onSendMessage, onDeleteOffer }: CouponManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"coupon" | "discount_product">("coupon");
  
  // Form States - Coupon
  const [couponLink, setCouponLink] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponStore, setCouponStore] = useState("");
  const [couponTitle, setCouponTitle] = useState("");
  const [couponCategory, setCouponCategory] = useState("Eletrônicos");
  const [couponRelevance, setCouponRelevance] = useState(8);
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponCopy, setCouponCopy] = useState("");
  const [couponCopyCustomized, setCouponCopyCustomized] = useState(false);
  const [couponImageUrl, setCouponImageUrl] = useState("");
 
  // Form States - Discount Product
  const [prodLink, setProdLink] = useState("");
  const [prodStore, setProdStore] = useState("");
  const [prodTitle, setProdTitle] = useState("");
  const [prodOriginalPrice, setProdOriginalPrice] = useState("");
  const [prodPromoPrice, setProdPromoPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("Eletrônicos");
  const [prodRelevance, setProdRelevance] = useState(8);
  const [prodCopy, setProdCopy] = useState("");
  const [prodCopyCustomized, setProdCopyCustomized] = useState(false);
  const [prodImageUrl, setProdImageUrl] = useState("");

  // Auto Copy generator templates
  const getAutoCouponCopy = (store: string, code: string, title: string) => {
    return `🎟️ CUPOM DE DESCONTO ENCONTRADO! 🎟️\n\n🏪 Loja: ${store || "Acessar Loja"}\n🛒 Benefício: ${title || "Desconto Especial"}\n🎟️ Cupom: ${code || "Sem cupom"}\n\n👉 Resgate seu cupom e compre aqui:\n[LINK_AFILIADO]\n\n#cupom #desconto #promocao`;
  };

  const getAutoProdCopy = (store: string, title: string, promoPrice: string, originalPrice: string) => {
    const promo = promoPrice ? `R$ ${promoPrice}` : "Preço imperdível";
    const deText = originalPrice ? `De: ~~R$ ${originalPrice}~~\n` : "";
    return `🔥 PROMOÇÃO IMPERDÍVEL! 🔥\n\n🛍️ ${title || "Produto em oferta"}\n🏪 Loja: ${store || "Ver Loja"}\n\n${deText}✅ Por apenas: ${promo}!\n\n👉 Compre pelo link oficial de afiliado:\n[LINK_AFILIADO]\n\n#ofertas #promocao #achadinhos`;
  };

  // Sync copy states in real-time
  React.useEffect(() => {
    if (!couponCopyCustomized) {
      setCouponCopy(getAutoCouponCopy(couponStore, couponCode, couponTitle));
    }
  }, [couponStore, couponCode, couponTitle, couponCopyCustomized]);

  React.useEffect(() => {
    if (!prodCopyCustomized) {
      setProdCopy(getAutoProdCopy(prodStore, prodTitle, prodPromoPrice, prodOriginalPrice));
    }
  }, [prodStore, prodTitle, prodPromoPrice, prodOriginalPrice, prodCopyCustomized]);

  // Shared status states
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<('telegram' | 'whatsapp')[]>(["telegram", "whatsapp"]);

  // Filter only Coupons and Discount Products for the table
  const couponsAndDiscounts = offers.filter(
    (o) => o.type === "coupon" || o.type === "discount_product"
  );

  const handleChannelToggle = (channel: 'telegram' | 'whatsapp') => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  // Generate marketing copy using Gemini API
  const handleGenerateAICopy = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGeneratingCopy(true);

    let prompt = "";
    if (activeSubTab === "coupon") {
      if (!couponStore || !couponTitle || !couponCode) {
        setErrorMessage("Por favor, preencha pelo menos a Loja, o Título/Benefício e o Código do Cupom para que a IA crie a copy.");
        setIsGeneratingCopy(false);
        return;
      }
      prompt = `Crie uma cópia altamente persuasiva no estilo afiliado de grupo de ofertas brasileiro para um CUPOM DE DESCONTO.
Dados do cupom:
- Loja: ${couponStore}
- Cupom Código: ${couponCode}
- Título/Benefício: ${couponTitle}
- Link do Site: ${couponLink || "Acesse pelo link"}
- Categoria do produto: ${couponCategory}
${couponDiscount ? `- Desconto anunciado: ${couponDiscount}` : ""}

Instruções importantes:
- Use emojis atrativos e chamativos.
- Indique claramente o cupom e onde utilizá-lo.
- Lembre-se de adicionar a tag literal "[LINK_AFILIADO]" exatamente onde o link afiliado encurtado deve ser clicado pelo cliente.
- Adicione 3 hashtags relevantes no final.`;
    } else {
      if (!prodStore || !prodTitle || !prodPromoPrice) {
        setErrorMessage("Por favor, preencha a Loja, o Título do Produto e o Preço Promocional para que a IA crie a copy.");
        setIsGeneratingCopy(false);
        return;
      }
      prompt = `Crie uma cópia altamente persuasiva no estilo afiliado de grupo de ofertas brasileiro para um PRODUTO COM DESCONTO.
Dados do produto:
- Loja: ${prodStore}
- Título do Produto: ${prodTitle}
- Preço Promocional: R$ ${prodPromoPrice}
${prodOriginalPrice ? `- Preço Original: R$ ${prodOriginalPrice}` : ""}
- Link do Produto: ${prodLink || "Acesse pelo link"}
- Categoria: ${prodCategory}

Instruções importantes:
- Use emojis atrativos e chamativos.
- Mostre o preço original e a super economia de preço promocional.
- Lembre-se de adicionar a tag literal "[LINK_AFILIADO]" exatamente onde o link afiliado encurtado deve ser clicado pelo cliente.
- Adicione 3 hashtags relevantes no final.`;
    }

    try {
      const response = await fetch("/api/generate-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: prompt })
      });

      const data = await response.json();
      if (response.ok && data.success && data.extracted?.craftedCopy) {
        if (activeSubTab === "coupon") {
          setCouponCopy(data.extracted.craftedCopy);
        } else {
          setProdCopy(data.extracted.craftedCopy);
        }
        setSuccessMessage("Copy promocional gerada com sucesso pela IA! ✨");
      } else {
        setErrorMessage(data.error || "Erro ao gerar a copy com IA. Você pode escrever ou colar uma cópia manualmente.");
      }
    } catch (err) {
      console.error("AI Copy generation error:", err);
      setErrorMessage("Não foi possível conectar ao servidor de IA. Tente digitar a cópia manualmente.");
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleSave = async (status: "draft" | "sent") => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate
    if (activeSubTab === "coupon") {
      if (!couponTitle || !couponStore || !couponCode) {
        setErrorMessage("Por favor, preencha o Título, a Loja e o Código do Cupom.");
        return;
      }
    } else {
      if (!prodTitle || !prodStore || !prodPromoPrice) {
        setErrorMessage("Por favor, preencha o Título do Produto, a Loja e o Preço Promocional.");
        return;
      }
    }

    if (selectedChannels.length === 0 && status === "sent") {
      setErrorMessage("Por favor, selecione pelo menos um canal (Telegram ou WhatsApp) para disparar.");
      return;
    }

    if (status === "draft") {
      setIsSaving(true);
    } else {
      setIsSending(true);
    }

    try {
      // Assemble offer payload
      let offerPayload: Partial<Offer> = {};

      if (activeSubTab === "coupon") {
        const discountNum = couponDiscount ? parseFloat(couponDiscount.replace("%", "").trim()) : null;
        offerPayload = {
          type: "coupon",
          title: `[CUPOM] ${couponStore} - ${couponTitle}`,
          description: couponCopy || `🔥 Aproveite o cupom de desconto na ${couponStore}!\n\n🎟️ Cupom: ${couponCode}\n\n👉 Compre aqui: [LINK_AFILIADO]`,
          originalUrl: couponLink || `https://${couponStore.toLowerCase().replace(/\s+/g, "")}.com.br`,
          store: couponStore,
          couponCode: couponCode,
          price: 0,
          originalPrice: null,
          discountPercent: isNaN(Number(discountNum)) ? null : Number(discountNum),
          category: couponCategory,
          relevance: couponRelevance,
          status: status,
          channels: selectedChannels,
          imageUrl: couponImageUrl
        };
      } else {
        const promoPrice = parseFloat(prodPromoPrice.replace(",", "."));
        const origPrice = prodOriginalPrice ? parseFloat(prodOriginalPrice.replace(",", ".")) : null;
        let discount = null;
        if (origPrice && promoPrice && origPrice > promoPrice) {
          discount = Math.round(((origPrice - promoPrice) / origPrice) * 100);
        }

        offerPayload = {
          type: "discount_product",
          title: prodTitle,
          description: prodCopy || `🔥 PROMOÇÃO IMPERDÍVEL na ${prodStore}!\n\n🛍️ ${prodTitle}\n\nDe: R$ ${origPrice?.toFixed(2)} por apenas R$ ${promoPrice.toFixed(2)}!\n\n👉 Adquira pelo link: [LINK_AFILIADO]`,
          originalUrl: prodLink || "https://www.amazon.com.br",
          store: prodStore,
          price: isNaN(promoPrice) ? 0 : promoPrice,
          originalPrice: isNaN(Number(origPrice)) ? null : origPrice,
          discountPercent: discount,
          category: prodCategory,
          relevance: prodRelevance,
          status: status,
          channels: selectedChannels,
          imageUrl: prodImageUrl
        };
      }

      // 1. Create or edit the offer in db
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerPayload)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const createdId = data.id;

        // 2. If status is sent, dispatch the messages to the channels
        if (status === "sent") {
          const sendResponse = await fetch(`/api/send-message/${createdId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channels: selectedChannels })
          });

          if (sendResponse.ok) {
            setSuccessMessage("Cupom/Desconto enviado com sucesso para os grupos e cadastrado no portal! 🚀");
            clearForm();
            window.dispatchEvent(new CustomEvent("offers-updated"));
          } else {
            setErrorMessage("Salvo no sistema, mas houve uma falha ao enviar aos canais do Telegram/WhatsApp.");
          }
        } else {
          setSuccessMessage("Cupom/Desconto salvo com sucesso como rascunho! 📁");
          clearForm();
          window.dispatchEvent(new CustomEvent("offers-updated"));
        }
      } else {
        setErrorMessage(data.error || "Erro ao salvar a publicação.");
      }
    } catch (err: any) {
      console.error("Save coupon/discount error:", err);
      setErrorMessage(err.message || "Erro de rede ao salvar.");
    } finally {
      setIsSaving(false);
      setIsSending(false);
    }
  };

  const clearForm = () => {
    // Clear Coupon form
    setCouponLink("");
    setCouponCode("");
    setCouponStore("");
    setCouponTitle("");
    setCouponDiscount("");
    setCouponCopy("");
    setCouponRelevance(8);
    setCouponCopyCustomized(false);
    setCouponImageUrl("");

    // Clear Product form
    setProdLink("");
    setProdStore("");
    setProdTitle("");
    setProdOriginalPrice("");
    setProdPromoPrice("");
    setProdCopy("");
    setProdRelevance(8);
    setProdCopyCustomized(false);
    setProdImageUrl("");
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Deseja realmente excluir este cupom/desconto?")) {
      const success = await onDeleteOffer(id);
      if (success) {
        setSuccessMessage("Item excluído com sucesso.");
      } else {
        setErrorMessage("Erro ao excluir o item.");
      }
    }
  };

  const handleSendNow = async (id: string) => {
    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const success = await onSendMessage(id, ["telegram", "whatsapp"]);
      if (success) {
        setSuccessMessage("Mensagem disparada com sucesso para os grupos cadastrados! 🚀");
        window.dispatchEvent(new CustomEvent("offers-updated"));
      } else {
        setErrorMessage("Erro ao enviar a mensagem. Verifique suas configurações de API.");
      }
    } catch (e) {
      setErrorMessage("Falha de conexão com o servidor.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="coupon-manager-root" className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Cupons & Descontos Especiais
            </h2>
            <p className="text-slate-300 text-xs">
              Adicione cupons de descontos para lojas ou links de produtos em oferta. Dispare-os direto em canais ou salve para o catálogo público.
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation for Coupons vs Products with Discount */}
        <div className="flex bg-white/5 p-1 rounded-xl gap-2 border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => { setActiveSubTab("coupon"); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "coupon"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Ticket className="w-4 h-4" /> Cupom de Desconto do Site
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab("discount_product"); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "discount_product"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Tag className="w-4 h-4" /> Link de Produto com Desconto
          </button>
        </div>

        {/* Display Status Messages */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2 mb-4 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center gap-2 mb-4 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Inner forms container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: Structured fields input */}
          <div className="space-y-4">
            {activeSubTab === "coupon" ? (
              // Coupon Form
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                    Link de Origem do Site / Loja
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.natura.com.br/promocao-especial"
                    value={couponLink}
                    onChange={(e) => setCouponLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                    Link da Foto do Anúncio (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/foto-do-anuncio.jpg"
                    value={couponImageUrl}
                    onChange={(e) => setCouponImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                      Código do Cupom *
                    </label>
                    <input
                      type="text"
                      placeholder="NATURA20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-amber-300 font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all placeholder:font-sans placeholder:font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                      Loja / Marca *
                    </label>
                    <input
                      type="text"
                      placeholder="Natura"
                      value={couponStore}
                      onChange={(e) => setCouponStore(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                    Título / Benefício do Cupom *
                    <span className="text-[9px] text-slate-400 lowercase ml-1.5">(ex: 20% OFF em cosméticos)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="20% de Desconto em todo o setor de perfumes"
                    value={couponTitle}
                    onChange={(e) => setCouponTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                      Categoria
                    </label>
                    <select
                      value={couponCategory}
                      onChange={(e) => setCouponCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                    >
                      {settings.categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                      Desconto (%)
                    </label>
                    <input
                      type="text"
                      placeholder="20"
                      value={couponDiscount}
                      onChange={(e) => setCouponDiscount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-emerald-300 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                    Relevância do Alerta (1 a 10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={couponRelevance}
                    onChange={(e) => setCouponRelevance(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1.5">
                    <span>1 (Discreto)</span>
                    <span className="text-amber-400">Nota: {couponRelevance}/10</span>
                    <span>10 (Imperdível 💥)</span>
                  </div>
                </div>
              </>
            ) : (
              // Product Discount Form
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                    Link do Produto com Desconto
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.amazon.com.br/dp/B0BZS854F5"
                    value={prodLink}
                    onChange={(e) => setProdLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                    Link da Foto do Anúncio (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/foto-do-anuncio.jpg"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                      Nome da Loja *
                    </label>
                    <input
                      type="text"
                      placeholder="Amazon"
                      value={prodStore}
                      onChange={(e) => setProdStore(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                      Categoria do Produto
                    </label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                    >
                      {settings.categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                    Título / Nome do Produto *
                  </label>
                  <input
                    type="text"
                    placeholder="Fritadeira Elétrica Mondial Family Air Fryer 4L"
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                      Preço Original (R$)
                    </label>
                    <input
                      type="text"
                      placeholder="399.90"
                      value={prodOriginalPrice}
                      onChange={(e) => setProdOriginalPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                      Preço com Desconto (R$) *
                    </label>
                    <input
                      type="text"
                      placeholder="289.00"
                      value={prodPromoPrice}
                      onChange={(e) => setProdPromoPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                    Relevância da Oferta (1 a 10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={prodRelevance}
                    onChange={(e) => setProdRelevance(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1.5">
                    <span>1 (Discreto)</span>
                    <span className="text-amber-400 font-bold">Nota: {prodRelevance}/10</span>
                    <span>10 (Imperdível 💥)</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: AI Copywriter and Dispatch action */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                  Texto Final Promocional (Copy de Afiliado)
                </label>
                
                {(activeSubTab === "coupon" ? couponCopyCustomized : prodCopyCustomized) ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSubTab === "coupon") {
                        setCouponCopyCustomized(false);
                      } else {
                        setProdCopyCustomized(false);
                      }
                    }}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer select-none"
                    title="Restaurar o texto promocional para o modelo padrão"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: "3s" }} />
                    Restaurar Padrão 🔄
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-lg">
                    ✨ Modelo Padrão Ativo
                  </span>
                )}
              </div>

              <textarea
                rows={6}
                placeholder="Preencha os campos ao lado para gerar o texto padrão automaticamente ou digite seu texto customizado aqui."
                value={activeSubTab === "coupon" ? couponCopy : prodCopy}
                onChange={(e) => {
                  if (activeSubTab === "coupon") {
                    setCouponCopy(e.target.value);
                    setCouponCopyCustomized(true);
                  } else {
                    setProdCopy(e.target.value);
                    setProdCopyCustomized(true);
                  }
                }}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all placeholder:text-slate-400 font-mono leading-relaxed"
              />
              <p className="text-[10px] text-slate-400">
                * Importante: mantenha o marcador <code>[LINK_AFILIADO]</code> no texto. Ele será substituído pelo seu link personalizado com tag de parceiro no momento do disparo!
              </p>

              {/* Target delivery channels selection */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <span className="block text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                  Canais de Disparo Ativos
                </span>
                
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes("telegram")}
                      onChange={() => handleChannelToggle("telegram")}
                      className="w-4 h-4 rounded border-white/10 text-indigo-600 bg-white/5 focus:ring-indigo-500/20 focus:ring-offset-0 cursor-pointer"
                    />
                    Disparar no Telegram {settings.telegramChatId ? "📢" : "⚠️ (Simulado)"}
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes("whatsapp")}
                      onChange={() => handleChannelToggle("whatsapp")}
                      className="w-4 h-4 rounded border-white/10 text-indigo-600 bg-white/5 focus:ring-indigo-500/20 focus:ring-offset-0 cursor-pointer"
                    />
                    Disparar no WhatsApp {settings.whatsappWebhookUrl ? "💬" : "⚠️ (Simulado)"}
                  </label>
                </div>
              </div>
            </div>

            {/* Action dispatch buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={isSaving || isSending || isGeneratingCopy}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Calendar className="w-4 h-4 text-indigo-400" /> Salvar como Rascunho
              </button>

              <button
                type="button"
                onClick={() => handleSave("sent")}
                disabled={isSaving || isSending || isGeneratingCopy}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Disparando Post...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Enviar & Disparar Agora
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* LOWER: Coupons & Discount list for quick management */}
      <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-white">
              Cupons & Produtos em Desconto Cadastrados ({couponsAndDiscounts.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Lista de itens de cupom ou desconto publicados e rascunhos.
            </p>
          </div>
        </div>

        <div className="p-6">
          {couponsAndDiscounts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2 border border-dashed border-white/10 bg-white/[0.01] rounded-xl">
              <Ticket className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-semibold">Nenhum cupom ou desconto cadastrado ainda.</p>
              <p className="text-[10px] max-w-xs mx-auto text-slate-500">
                Adicione cupons acima para dar mais opções de descontos aos seus leitores no portal e nos grupos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Loja</th>
                    <th className="py-3 px-4">Título / Oferta</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Cliques</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {couponsAndDiscounts.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.01] transition-all">
                      <td className="py-3 px-4 font-semibold">
                        {item.type === "coupon" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            <Ticket className="w-3 h-3" /> CUPOM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <Tag className="w-3 h-3" /> PRODUTO
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">
                        {item.store}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 max-w-sm truncate" title={item.title}>
                          {item.title}
                        </div>
                        {item.couponCode && (
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.2 rounded mt-1 inline-block">
                            Cupom: {item.couponCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.status === "sent" ? (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full">
                            Enviado
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded-full">
                            Rascunho
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-300">
                        {item.clicksCount}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <a
                          href={item.originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block p-1.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-all"
                          title="Ver link cadastrado"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {item.status === "draft" && (
                          <button
                            type="button"
                            onClick={() => handleSendNow(item.id)}
                            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
                            title="Disparar nos grupos agora"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition-all"
                          title="Excluir cupom"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
