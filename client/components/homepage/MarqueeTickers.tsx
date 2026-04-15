"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/client";

interface Activity {
  id: string;
  from: string;
  to: string;
  value: number;
  category: string;
  status: string;
  createdAt: string;
}

function formatAmount(amount: number) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
}

export function ForwardMarquee() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch('/api/public/recent-activity');
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (err) {
        console.error('Failed to fetch activity:', err);
      }
    }
    fetchActivity();
  }, []);

  // Default placeholders if no data yet
  const displayItems = activities.length > 0 ? activities : [
    { id: 'SHP-8922', from: 'CN', to: 'US', value: 1200000, status: 'Processing' },
    { id: 'LOG-4412', from: 'DE', to: 'FR', value: 540000, status: 'Processing' },
    { id: 'AIR-9910', from: 'JP', to: 'UK', value: 3100000, status: 'Delivered' },
  ];

  return (
    <div className="w-full bg-background/80 backdrop-blur-md border-y border-border py-4 overflow-hidden relative z-20 shadow-2xl">
      <div className="flex gap-16 animate-marquee whitespace-nowrap text-sm font-mono text-muted-foreground">
        {displayItems.map((item, idx) => (
          <span key={`${item.id}-${idx}`} className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
            <span className="text-primary animate-pulse">●</span> {item.id}: {item.from} &gt; {item.to} <span className="text-white font-bold">{formatAmount(item.value)}</span>{" "}
            <span className={item.status === 'Delivered' ? "text-slate-400 flex items-center gap-1 text-xs bg-white/10 px-1 rounded" : "text-green-400 flex items-center gap-1 text-xs bg-green-400/10 px-1 rounded"}>
              {item.status === 'Processing' ? t("marquee.processing", "Processing") : t("marquee.delivered", "Delivered")}
            </span>
          </span>
        ))}
        {/* Duplicates for seamless loop */}
        {displayItems.map((item, idx) => (
          <span key={`${item.id}-dup-${idx}`} className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
            <span className="text-primary animate-pulse">●</span> {item.id}: {item.from} &gt; {item.to} <span className="text-white font-bold">{formatAmount(item.value)}</span>{" "}
            <span className={item.status === 'Delivered' ? "text-slate-400 flex items-center gap-1 text-xs bg-white/10 px-1 rounded" : "text-green-400 flex items-center gap-1 text-xs bg-green-400/10 px-1 rounded"}>
              {item.status === 'Processing' ? t("marquee.processing", "Processing") : t("marquee.delivered", "Delivered")}
            </span>
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
