"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, Search, Plus, TrendingUp, Truck, Users, LineChart, Bell } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="relative h-dvh flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0b1019] to-[#0b1019]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />

      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0b1019]/30 backdrop-blur-sm z-40">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Executive Overview
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
              Live
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Welcome back, Admin</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#151c2a]/50 border border-white/5 text-sm text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Status: Operational
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <input
                className="pl-10 pr-4 py-2 bg-[#151c2a]/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary w-64 transition-all"
                placeholder="Search shipments, IDs..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#151c2a]/50 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors" type="button">
              <CalendarDays className="w-4 h-4" />
            </button>
            <Link
              href="/dashboard/admin/notifications"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary hover:bg-[#0f49bd] text-white shadow-lg shadow-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1920px] mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { label: "Active Shipments", value: "128", icon: Truck, delta: "+12.5%" },
              { label: "Verified Partners", value: "3,420", icon: Users, delta: "+3.2%" },
              { label: "Market Signals", value: "15", icon: LineChart, delta: "+0.8%" },
              { label: "Alerts", value: "7", icon: Bell, delta: "-1" },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl p-6 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="flex items-center text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {s.delta}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-slate-400 text-sm font-medium">{s.label}</h3>
                    <p className="text-3xl font-bold text-white tracking-tight">{s.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white text-lg font-bold tracking-tight">Live Operations Feed</h2>
                  <p className="text-slate-400 text-sm">Shipments, payments, and compliance events.</p>
                </div>
                <Link
                  href="/dashboard/admin/notifications"
                  className="text-primary text-sm font-bold hover:underline"
                >
                  Open Alerts Center
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { t: "Shipment Arrived", d: "Port of Los Angeles — pending clearance" },
                  { t: "Payment Action", d: "Invoice approval required for ORD-2023-11" },
                  { t: "Compliance Missing", d: "Certificate required for customs processing" },
                  { t: "Route Delay", d: "Shanghai congestion — ETA updated" },
                ].map((x) => (
                  <div key={x.t} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-primary/30 transition-colors">
                    <div className="text-sm font-bold text-white">{x.t}</div>
                    <div className="text-xs text-slate-400 mt-1">{x.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-4 space-y-4">
              <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
                <div className="text-white text-lg font-bold tracking-tight">Quick Links</div>
                <div className="mt-4 space-y-2">
                  {[
                    { href: "/dashboard/admin/inventory", label: "Inventory Management" },
                    { href: "/dashboard/admin/categories", label: "All Categories" },
                    { href: "/dashboard/admin/directory", label: "Partner Directory" },
                    { href: "/dashboard/admin/trends", label: "Market Trends" },
                  ].map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 hover:text-white hover:border-primary/30 transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
