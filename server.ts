import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// --- DATABASE PERSISTENCE ENGINE (db.json) ---
const DB_FILE = path.join(process.cwd(), "db.json");

interface LocalDb {
  settings: any;
  offers: any[];
  clicks: any[];
}

const defaultSettings = {
  telegramToken: "",
  telegramChatId: "",
  whatsappWebhookUrl: "",
  whatsappApiKey: "",
  whatsappGroupJid: "",
  amazonAssociateId: "seutag-20",
  shopeeSubId: "afiliado123",
  generalRedirectPrefix: "/r/",
  categories: ["Eletrônicos", "Moda", "Casa & Cozinha", "Livros", "Games", "Beleza & Cuidado", "Supermercado", "Outros"]
};

function getDb(): LocalDb {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      // Ensure all collections exist
      if (!data.settings) data.settings = { ...defaultSettings };
      if (!data.offers) data.offers = [];
      if (!data.clicks) data.clicks = [];
      return data;
    }
  } catch (e) {
    console.error("Error reading db.json:", e);
  }
  
  // Initialize and save default DB if not present
  const initialDb = {
    settings: { ...defaultSettings },
    offers: [],
    clicks: []
  };
  saveDb(initialDb);
  return initialDb;
}

function saveDb(data: LocalDb) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing db.json:", e);
  }
}

// --- GEMINI CLIENT LAZY INITIALIZATION ---
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Affiliate URL Helper Engine
function transformAffiliateUrl(url: string, settings: any): string {
  if (!url) return "";
  let finalUrl = url;

  try {
    const parsedUrl = new URL(url);

    // Amazon Brazil or global Link Replacer
    if (parsedUrl.hostname.includes("amazon.com")) {
      const tag = settings.amazonAssociateId || "seutag-20";
      parsedUrl.searchParams.set("tag", tag);
      // Clean typical Amazon noise parameters
      parsedUrl.searchParams.delete("psc");
      parsedUrl.searchParams.delete("ref_");
      finalUrl = parsedUrl.toString();
    }
    // Shopee Link
    else if (parsedUrl.hostname.includes("shopee.com")) {
      const subId = settings.shopeeSubId || "afiliado123";
      parsedUrl.searchParams.set("sub_id", subId);
      finalUrl = parsedUrl.toString();
    }
    // Mercado Livre
    else if (parsedUrl.hostname.includes("mercadolivre.com") || parsedUrl.hostname.includes("mercadolibre.com")) {
      parsedUrl.searchParams.set("utm_source", "affiliate");
      parsedUrl.searchParams.set("utm_medium", "promobot");
      finalUrl = parsedUrl.toString();
    }
  } catch (e) {
    // If URL parsing fails, return original
  }

  return finalUrl;
}

// --- API ROUTES ---

// GET settings
app.get("/api/settings", async (req, res) => {
  try {
    const data = getDb();
    return res.json(data.settings);
  } catch (error: any) {
    console.error("Error reading settings:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST settings
app.post("/api/settings", async (req, res) => {
  try {
    const newSettings = req.body;
    const data = getDb();
    data.settings = { ...data.settings, ...newSettings };
    saveDb(data);
    return res.json({ success: true, settings: data.settings });
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET offers (both for admin panel and public view)
app.get("/api/offers", async (req, res) => {
  try {
    const data = getDb();
    // Sort offers descending by creation date
    const sorted = [...data.offers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(sorted);
  } catch (error: any) {
    console.error("Error getting offers:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST manually create / edit offer
app.post("/api/offers", async (req, res) => {
  try {
    const offerData = req.body;
    const now = new Date().toISOString();
    
    const data = getDb();
    const resolvedAffiliateUrl = transformAffiliateUrl(offerData.originalUrl || "", data.settings);

    const offerId = offerData.id || `off_${Math.random().toString(36).substring(2, 11)}`;
    const newOffer = {
      id: offerId,
      title: offerData.title || "Oferta sem título",
      description: offerData.description || "",
      originalUrl: offerData.originalUrl || "",
      affiliateUrl: offerData.affiliateUrl || resolvedAffiliateUrl || offerData.originalUrl || "",
      store: offerData.store || "Outra Loja",
      price: Number(offerData.price) || 0,
      originalPrice: offerData.originalPrice ? Number(offerData.originalPrice) : null,
      discountPercent: offerData.discountPercent ? Number(offerData.discountPercent) : null,
      category: offerData.category || "Outros",
      relevance: Number(offerData.relevance) || 5,
      status: offerData.status || "draft",
      createdAt: offerData.createdAt || now,
      scheduledAt: offerData.scheduledAt || null,
      sentAt: offerData.sentAt || null,
      clicksCount: offerData.clicksCount || 0,
      channels: offerData.channels || ["telegram", "whatsapp"],
      type: offerData.type || "offer",
      couponCode: offerData.couponCode || "",
      imageUrl: offerData.imageUrl || ""
    };

    const existingIdx = data.offers.findIndex(o => o.id === offerId);
    if (existingIdx > -1) {
      data.offers[existingIdx] = { ...data.offers[existingIdx], ...newOffer };
    } else {
      data.offers.push(newOffer);
    }
    saveDb(data);
    
    return res.json({ success: true, id: offerId, offer: newOffer });
  } catch (error: any) {
    console.error("Error saving offer:", error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE offer
app.delete("/api/offers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = getDb();
    data.offers = data.offers.filter(o => o.id !== id);
    saveDb(data);
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting offer:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST Parse/scan offer using Gemini AI
app.post("/api/generate-offer", async (req, res) => {
  try {
    const { rawInput } = req.body;
    if (!rawInput) {
      return res.status(400).json({ error: "O texto bruto da oferta ou link é obrigatório." });
    }

    const data = getDb();
    const currentSettings = data.settings;
    const ai = getGeminiClient();

    const systemInstruction = `Você é o assistente inteligente "PromoLink AI", especialista em marketing de afiliados brasileiro.
Sua missão é extrair dados de uma mensagem promocional bruta ou link e criar uma publicação ideal altamente atrativa em português para WhatsApp e Telegram.

Instruções para a cópia (craftedCopy):
- Use emojis atraentes para chamar atenção no início de cada linha (ex: 🔥, 💥, 🚨, 💻, 📦).
- Crie um título curto e impactante.
- Mostre claramente o preço original riscado (se houver) e o preço promocional atual.
- Indique o percentual de desconto calculado.
- Adicione uma chamada para ação clara como "👉 Compre aqui: [LINK_AFILIADO]" ou "🛒 Pegue o seu aqui: [LINK_AFILIADO]". O texto deve obrigatoriamente conter a tag literal [LINK_AFILIADO] onde o link será inserido.
- Adicione hashtags relevantes no final (máximo 3, ex: #promocao #achadinhos #oferta).

Retorne EXCLUSIVAMENTE um objeto JSON válido, sem comentários, sem blocos de markdown adicionais, obedecendo a este esquema exato:
{
  "title": "Título curto e amigável do produto",
  "price": 199.90, // número
  "originalPrice": 250.00, // número ou null
  "discountPercent": 20, // número de 0 a 100 ou null
  "store": "Amazon" | "Shopee" | "Mercado Livre" | "Magalu" | "AliExpress" | "Outro",
  "category": "Eletrônicos" | "Moda" | "Casa & Cozinha" | "Livros" | "Games" | "Beleza & Cuidado" | "Supermercado" | "Outros",
  "relevance": 8, // Inteiro de 1 a 10 avaliando o quão imperdível é o desconto
  "craftedCopy": "Cópia promocional estruturada com emojis e a tag [LINK_AFILIADO]"
}
`;

    const userPrompt = `Analise a seguinte oferta bruta:\n\n${rawInput}\n\nLembre-se de retornar apenas o JSON conforme as instruções.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    const parsedData = JSON.parse(responseText.trim());

    // Try to extract any URL in the raw text to convert into affiliate format
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = rawInput.match(urlRegex);
    const originalUrl = urls && urls.length > 0 ? urls[0] : "https://www.amazon.com.br";
    const affiliateUrl = transformAffiliateUrl(originalUrl, currentSettings);

    return res.json({
      success: true,
      extracted: {
        ...parsedData,
        originalUrl,
        affiliateUrl
      }
    });
  } catch (error: any) {
    console.error("Gemini Parsing error:", error);
    return res.status(500).json({ error: error.message || "Erro desconhecido ao processar com IA." });
  }
});

// POST Send / Automation endpoint
app.post("/api/send-message/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { channels } = req.body; // array e.g. ["telegram", "whatsapp"]

    const data = getDb();
    const offerIndex = data.offers.findIndex(o => o.id === id);
    if (offerIndex === -1) {
      return res.status(404).json({ error: "Oferta não encontrada." });
    }

    const offer = data.offers[offerIndex];
    const settings = data.settings;
    const results: any = { telegram: null, whatsapp: null };
    
    // As requested, use the actual affiliate URL instead of the localhost tracking link
    const textToSend = offer.description.replace("[LINK_AFILIADO]", offer.affiliateUrl || offer.originalUrl);

    // 1. Send to Telegram
    if (channels.includes("telegram")) {
      if (settings.telegramToken && settings.telegramChatId) {
        try {
          let telegramUrl = `https://api.telegram.org/bot${settings.telegramToken}/sendMessage`;
          let bodyPayload: any = {
            chat_id: settings.telegramChatId,
            text: textToSend,
            disable_web_page_preview: false
          };

          if (offer.imageUrl && offer.imageUrl.trim() !== "") {
            telegramUrl = `https://api.telegram.org/bot${settings.telegramToken}/sendPhoto`;
            bodyPayload = {
              chat_id: settings.telegramChatId,
              photo: offer.imageUrl.trim(),
              caption: textToSend
            };
          }

          const response = await fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyPayload)
          });
          const resData = await response.json();
          results.telegram = resData.ok ? { success: true } : { success: false, error: resData.description };
        } catch (tgError: any) {
          results.telegram = { success: false, error: tgError.message };
        }
      } else {
        // Simulated send
        results.telegram = { success: true, simulated: true, note: "Token do Telegram não configurado. Envio simulado com sucesso!" };
      }
    }

    // 2. Send to WhatsApp
    if (channels.includes("whatsapp")) {
      if (settings.whatsappWebhookUrl) {
        try {
          const bodyPayload: any = {
            number: settings.whatsappGroupJid,
            message: textToSend
          };

          if (offer.imageUrl && offer.imageUrl.trim() !== "") {
            // Include image fields for various WhatsApp API formats (Evolution, Z-API, Baileys)
            bodyPayload.image = offer.imageUrl.trim();
            bodyPayload.imageUrl = offer.imageUrl.trim();
            bodyPayload.mediaUrl = offer.imageUrl.trim();
            bodyPayload.caption = textToSend;
          }

          const response = await fetch(settings.whatsappWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(settings.whatsappApiKey ? { "Authorization": `Bearer ${settings.whatsappApiKey}` } : {})
            },
            body: JSON.stringify(bodyPayload)
          });
          if (response.ok) {
            results.whatsapp = { success: true };
          } else {
            const errText = await response.text();
            results.whatsapp = { success: false, error: `WhatsApp gateway returned status ${response.status}: ${errText}` };
          }
        } catch (waError: any) {
          results.whatsapp = { success: false, error: waError.message };
        }
      } else {
        results.whatsapp = { success: true, simulated: true, note: "Webhook do WhatsApp não configurado. Envio simulado com sucesso!" };
      }
    }

    // Update status in db
    const now = new Date().toISOString();
    offer.status = "sent";
    offer.sentAt = now;
    offer.channels = channels;
    data.offers[offerIndex] = offer;
    saveDb(data);

    return res.json({ success: true, results, offer });
  } catch (error: any) {
    console.error("Error sending offer:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET statistics aggregated from database
app.get("/api/stats", async (req, res) => {
  try {
    const data = getDb();
    const offersList = data.offers;
    const clicksList = data.clicks;

    // Calculations
    const totalClicks = clicksList.length;
    const totalOffers = offersList.length;
    const sentOffers = offersList.filter(o => o.status === "sent").length;

    // Clicks by Category
    const categoryMap: { [key: string]: number } = {};
    offersList.forEach(o => {
      const cat = o.category || "Outros";
      categoryMap[cat] = (categoryMap[cat] || 0) + (o.clicksCount || 0);
    });
    const clicksByCategory = Object.keys(categoryMap).map(name => ({
      name,
      clicks: categoryMap[name]
    })).sort((a, b) => b.clicks - a.clicks);

    // Clicks by Store
    const storeMap: { [key: string]: number } = {};
    offersList.forEach(o => {
      const st = o.store || "Outra Loja";
      storeMap[st] = (storeMap[st] || 0) + (o.clicksCount || 0);
    });
    const clicksByStore = Object.keys(storeMap).map(name => ({
      name,
      clicks: storeMap[name]
    })).sort((a, b) => b.clicks - a.clicks);

    // Clicks Over Time (last 7 days)
    const timelineMap: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      timelineMap[dateStr] = 0;
    }

    clicksList.forEach(click => {
      try {
        const clickDate = new Date(click.timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        if (timelineMap[clickDate] !== undefined) {
          timelineMap[clickDate]++;
        }
      } catch (e) {}
    });

    const clicksOverTime = Object.keys(timelineMap).map(date => ({
      date,
      clicks: timelineMap[date]
    }));

    return res.json({
      totalClicks,
      totalOffers,
      sentOffers,
      clicksByCategory,
      clicksByStore,
      clicksOverTime
    });
  } catch (error: any) {
    console.error("Error generating statistics:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET Affiliate Redirect Route (/r/:id)
app.get("/r/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = getDb();
    const offerIndex = data.offers.findIndex(o => o.id === id);
    if (offerIndex === -1) {
      return res.redirect("/");
    }

    const offer = data.offers[offerIndex];
    const now = new Date().toISOString();
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const referrer = req.headers["referer"] || "Direct";

    const clickData = {
      offerId: id,
      offerTitle: offer.title,
      timestamp: now,
      userAgent,
      ip,
      referrer
    };

    // Log the click
    data.clicks.push(clickData);
    offer.clicksCount = (offer.clicksCount || 0) + 1;
    data.offers[offerIndex] = offer;
    saveDb(data);

    console.log(`Click logged for offer [${offer.title}] - Redirecting to: ${offer.affiliateUrl}`);
    
    return res.redirect(offer.affiliateUrl);
  } catch (error) {
    console.error("Error in redirect route:", error);
    return res.redirect("/");
  }
});

// --- VITE AND STATIC ASSETS HANDLERS ---

async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PromoLink Server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Error starting PromoLink server:", err);
});
