"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/client";

export function ForwardMarquee() {
  const { t } = useTranslation();

  const displayItems = [
    { title: "INDIA BASED", subtitle: "Export & Sourcing" },
    { title: "MULTI-CATEGORY", subtitle: "Product Sourcing" },
    { title: "QUALITY FOCUSED", subtitle: "Supplier Coordination" },
    { title: "GLOBAL FOCUS", subtitle: "International Buyers" },
  ];

  return (
    <div className="w-full bg-background/80 backdrop-blur-md border-y border-border py-4 overflow-hidden relative z-20 shadow-2xl">
      <div className="flex gap-16 animate-marquee whitespace-nowrap text-sm font-mono text-muted-foreground">
        {displayItems.map((item, idx) => (
          <span key={`mq1-${idx}`} className="flex items-center gap-3 hover:text-white transition-colors cursor-default">
            <span className="text-primary animate-pulse">●</span> 
            <span className="text-white font-bold tracking-widest">{item.title}</span> 
            <span className="opacity-80">{item.subtitle}</span>
          </span>
        ))}
        {/* Duplicates for seamless loop */}
        {displayItems.map((item, idx) => (
          <span key={`mq2-${idx}`} className="flex items-center gap-3 hover:text-white transition-colors cursor-default">
            <span className="text-primary animate-pulse">●</span> 
            <span className="text-white font-bold tracking-widest">{item.title}</span> 
            <span className="opacity-80">{item.subtitle}</span>
          </span>
        ))}
        {/* Extra duplicates for ultra-wide screens */}
        {displayItems.map((item, idx) => (
          <span key={`mq3-${idx}`} className="flex items-center gap-3 hover:text-white transition-colors cursor-default">
            <span className="text-primary animate-pulse">●</span> 
            <span className="text-white font-bold tracking-widest">{item.title}</span> 
            <span className="opacity-80">{item.subtitle}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ReverseMarquee() {
  const { t } = useTranslation();
  const [tickers, setTickers] = useState<any[]>([]);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["EURUSDT","GBPUSDT","PAXGUSDT"]');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
           setTickers(data);
        }
      } catch (err) {
        console.error("Failed to fetch live tickers", err);
      }
    };
    fetchLive();
    const timer = setInterval(fetchLive, 5000);
    return () => clearInterval(timer);
  }, []);

  const getDetails = (symbol: string) => {
    if (symbol === "EURUSDT") return { icon: "currency_exchange", name: "Forex: EUR/USD" };
    if (symbol === "GBPUSDT") return { icon: "currency_exchange", name: "Forex: GBP/USD" };
    if (symbol === "PAXGUSDT") return { icon: "diamond", name: "Commodity: Gold (1 oz)" };
    return { icon: "public", name: symbol };
  };

  const renderItems = () => {
    if (tickers.length === 0) {
      return (
        <>
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-sm animate-pulse">public</span>
            850 {t("marquee.textiles", "tonnes of Textiles")}: Vietnam &gt; USA
            <span className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">+1.2% Vol</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-sm animate-pulse">local_shipping</span>
            {t("marquee.freight_index", "Freight Index")}: {t("marquee.global", "Global")}
            <span className="text-slate-900 dark:text-white font-bold">2,410 pts</span>
            <span className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">+2.4%</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-sm animate-pulse">oil_barrel</span>
            {t("marquee.crude_oil", "Crude Oil")}: {t("marquee.brent", "Brent")}
            <span className="text-slate-900 dark:text-white font-bold">$82.40/bbl</span>
            <span className="text-red-700 dark:text-red-400 font-bold bg-red-100 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs">-0.4%</span>
          </span>
        </>
      );
    }

    const elements = tickers.map((t, idx) => {
      const details = getDetails(t.symbol);
      const isPositive = parseFloat(t.priceChangePercent) >= 0;
      const pctColor = isPositive 
        ? "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/20" 
        : "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/20";
      
      return (
        <span key={t.symbol + idx} className="flex items-center gap-3 transition-colors duration-500">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">{details.icon}</span>
          {details.name}
          <span className="text-slate-900 dark:text-white font-bold transition-all duration-300">
            ${parseFloat(t.lastPrice).toFixed(t.symbol === "PAXGUSDT" ? 2 : 4)}
          </span>
          <span className={`${pctColor} font-bold px-2 py-0.5 rounded text-xs transition-all duration-300`}>
            {isPositive ? "+" : ""}{parseFloat(t.priceChangePercent).toFixed(2)}%
          </span>
        </span>
      );
    });

    // Duplicate for seamless loop
    return [...elements, ...elements, ...elements];
  };

  return (
    <div className="w-full bg-background border-y border-border py-6 overflow-hidden relative z-20">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="flex gap-20 animate-marquee-reverse whitespace-nowrap text-sm font-mono text-muted-foreground">
        {renderItems()}
        {renderItems()}
      </div>
    </div>
  );
}
