export interface Offer {
  id: string;
  title: string;
  description: string;
  originalUrl: string;
  affiliateUrl: string;
  store: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  category: string;
  relevance: number; // 1-10
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  createdAt: string;
  scheduledAt: string | null;
  sentAt: string | null;
  clicksCount: number;
  channels: ('telegram' | 'whatsapp')[];
  type?: 'offer' | 'coupon' | 'discount_product';
  couponCode?: string;
  imageUrl?: string;
}

export interface ClickLog {
  id: string;
  offerId: string;
  offerTitle: string;
  timestamp: string;
  userAgent: string;
  ip: string;
  referrer: string;
}

export interface BotSettings {
  telegramToken: string;
  telegramChatId: string;
  whatsappWebhookUrl: string;
  whatsappApiKey: string;
  whatsappGroupJid: string;
  amazonAssociateId: string;
  shopeeSubId: string;
  generalRedirectPrefix: string;
  categories: string[];
}

export interface DashboardStats {
  totalClicks: number;
  totalOffers: number;
  sentOffers: number;
  clicksByCategory: { name: string; clicks: number }[];
  clicksByStore: { name: string; clicks: number }[];
  clicksOverTime: { date: string; clicks: number }[];
}
