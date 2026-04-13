"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/client";
import { useFormat } from "@/lib/i18n/format";

interface Stats {
  shipments: number;
  volume: number;
  countries: number;
  products: number;
  users: number;
  latency: string;
  uptime: string;
}

export default function StatsBar() {
  const { t } = useTranslation();
  const { formatCompact } = useFormat();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="py-16 bg-background border-b border-border relative reveal-on-scroll active">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center md:text-left border-r border-border last:border-0 pr-4 group hover:bg-muted p-4 rounded transition-colors">
          <h3 className="text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {formatCompact(stats?.shipments || 2400000)}+
          </h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            {t("stats.shipments", "Shipments Tracked")}
          </p>
        </div>
        <div className="text-center md:text-left border-r border-border last:border-0 pr-4 group hover:bg-muted p-4 rounded transition-colors">
          <h3 className="text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            ${formatCompact(stats?.volume || 85000000000)}
          </h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            {t("stats.volume", "Trade Volume")}
          </p>
        </div>
        <div className="text-center md:text-left border-r border-border last:border-0 pr-4 group hover:bg-muted p-4 rounded transition-colors">
          <h3 className="text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {formatCompact(stats?.countries || 190)}+
          </h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            {t("stats.countries", "Countries Served")}
          </p>
        </div>
        <div className="text-center md:text-left pr-4 group hover:bg-muted p-4 rounded transition-colors">
          <h3 className="text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {stats?.latency || "0.01s"}
          </h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            {t("stats.latency", "Data Latency")}
          </p>
        </div>
      </div>
    </section>
  );
}
