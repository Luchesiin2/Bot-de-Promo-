import React, { useState, useEffect } from "react";
import { Bell, BellOff, Check, X, ShieldAlert, Sparkles, Volume2 } from "lucide-react";

interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

interface PushNotificationManagerProps {
  onNotificationDismiss?: () => void;
}

export default function PushNotificationManager({ onNotificationDismiss }: PushNotificationManagerProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeNotification, setActiveNotification] = useState<PushNotification | null>(null);
  const [showOptInBanner, setShowOptInBanner] = useState(true);

  // Load subscription status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("promolink-push-subscribed");
    if (saved === "true") {
      setIsSubscribed(true);
      setShowOptInBanner(false);
    }
  }, []);

  // Listen to custom "send-notification" events dispatched from App.tsx when a deal is published
  useEffect(() => {
    const handleNotificationEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { title, body, store, id } = customEvent.detail || {};

      if (isSubscribed) {
        // Trigger simulated audio beep for feedback
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
          // Audio context block ignore
        }

        // Trigger Notification toast
        setActiveNotification({
          id: id || Math.random().toString(),
          title: title || "Nova Oferta Incrível! 🔥",
          body: body || `Um super desconto acaba de chegar na loja ${store || "E-commerce"}. Clique para ver!`,
          icon: "🏷️"
        });

        // Auto-dismiss after 6 seconds
        setTimeout(() => {
          setActiveNotification(null);
        }, 6000);
      }
    };

    window.addEventListener("simulated-push-notification", handleNotificationEvent);
    return () => {
      window.removeEventListener("simulated-push-notification", handleNotificationEvent);
    };
  }, [isSubscribed]);

  const handleSubscribe = () => {
    setIsSubscribed(true);
    localStorage.setItem("promolink-push-subscribed", "true");
    setShowOptInBanner(false);

    // Initial Welcome Notification Toast
    setActiveNotification({
      id: "welcome",
      title: "Notificações Ativadas! 🔔",
      body: "Você começará a receber alertas de ofertas imperdíveis em tempo real diretamente no seu navegador.",
      icon: "🎉"
    });

    setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
  };

  const handleUnsubscribe = () => {
    setIsSubscribed(false);
    localStorage.setItem("promolink-push-subscribed", "false");
    setShowOptInBanner(true);
  };

  return (
    <div id="push-notification-wrapper" className="relative">
      {/* Real-time Push Notification Simulation Toast */}
      {activeNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full glass bg-slate-950/90 text-white rounded-2xl shadow-2xl border border-white/10 p-4 flex items-start gap-3.5 animate-slideLeft">
          <div className="w-10 h-10 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 text-xl">
            {activeNotification.icon || "🔥"}
          </div>
          <div className="flex-1 space-y-1 select-none">
            <div className="flex items-center justify-between">
              <span className="font-display font-extrabold text-xs text-indigo-300 tracking-wider flex items-center gap-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5 fill-indigo-450/20" /> ALERTA DE OFERTA
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Agora</span>
            </div>
            <h4 className="font-semibold text-xs text-white font-display">
              {activeNotification.title}
            </h4>
            <p className="text-[11px] text-slate-300 leading-normal">
              {activeNotification.body}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveNotification(null)}
            className="text-slate-400 hover:text-white transition-all p-1 hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Subscription Bar shown in the user interfaces */}
      {showOptInBanner ? (
        <div className="glass bg-indigo-550/[0.04] border border-indigo-500/25 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-white/5 border border-white/15 text-indigo-400 rounded-xl shadow-md shrink-0">
              <Bell className="w-5 h-5 text-indigo-400 animate-swing" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm">
                Ativar Notificações Push Personalizadas?
              </h3>
              <p className="text-slate-300 text-xs mt-0.5 max-w-lg">
                Seja avisado instantaneamente no seu navegador sempre que nossa IA encontrar e disparar uma promoção imperdível.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubscribe}
            className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 select-none border border-indigo-500/20"
          >
            <Bell className="w-3.5 h-3.5" /> Sim, me notificar!
          </button>
        </div>
      ) : (
        <div className="glass bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-300 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>
              Você está inscrito para receber notificações de ofertas.
            </span>
          </div>

          <button
            type="button"
            onClick={handleUnsubscribe}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-all cursor-pointer"
          >
            <BellOff className="w-3.5 h-3.5" /> Desativar notificações
          </button>
        </div>
      )}
    </div>
  );
}
