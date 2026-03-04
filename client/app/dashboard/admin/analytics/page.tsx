"use client";

import { motion } from "framer-motion";
import { BarChart3, CalendarDays, Radar, TrendingUp } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Trade Analytics</h1>
            <p className="text-sm text-muted-foreground">Real-time market insights and performance signals.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Oct 2023 - Nov 2023
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Panel
            title="Trend pulse"
            subtitle="Rolling 30-day activity"
            icon={<TrendingUp className="h-5 w-5" />}
          >
            <div className="h-48 rounded-xl border border-border bg-muted/40 grid place-items-center text-sm text-muted-foreground">
              Trend line placeholder (wire Recharts here)
            </div>
          </Panel>

          <Panel
            title="Market radar"
            subtitle="Category momentum"
            icon={<Radar className="h-5 w-5" />}
          >
            <div className="h-48 rounded-xl border border-border bg-muted/40 grid place-items-center text-sm text-muted-foreground">
              Radar chart placeholder
            </div>
          </Panel>

          <Panel
            title="Heatmap"
            subtitle="Region vs volume"
            icon={<BarChart3 className="h-5 w-5" />}
          >
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: 48 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.005 }}
                  className="aspect-square rounded bg-primary/10 hover:bg-primary/25 transition-colors"
                />
              ))}
            </div>
          </Panel>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="text-lg font-black">Insights</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { t: "Electronics", d: "Demand up 12% week-over-week" },
              { t: "Textiles", d: "Stable pricing; reduced variance" },
              { t: "Food", d: "Seasonal spike expected in 2 weeks" },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="text-sm font-black">{x.t}</div>
                <div className="text-xs text-muted-foreground mt-1">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}

function Panel({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-black">{title}</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">{icon}</div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
