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
  return (
    <div className="w-full bg-background border-y border-border py-6 overflow-hidden relative z-20">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="flex gap-20 animate-marquee-reverse whitespace-nowrap text-sm font-mono text-muted-foreground">
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
        {/* Duplicates for seamless loop */}
        <span className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">public</span>
          850 {t("marquee.textiles", "tonnes of Textiles")}: Vietnam &gt; USA
          <span className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">+1.2% Vol</span>
        </span>
      </div>
    </div>
  );
}
