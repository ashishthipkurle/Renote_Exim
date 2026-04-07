'use client';

import React, { use, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Package,
  Plane,
  Anchor,
  Globe,
  TrendingUp,
  ArrowDownRight,
  Clock,
  XCircle,
  AlertCircle,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const STEPS = [
  { id: 'PREPARING', label: 'PREPARING', icon: Package },
  { id: 'IN_TRANSIT', label: 'IN TRANSIT', icon: Plane },
  { id: 'CUSTOMS', label: 'CUSTOMS SECTION', icon: ShieldCheck },
  { id: 'OUT_FOR_DELIVERY', label: 'LAST MILE', icon: Truck },
  { id: 'DELIVERED', label: 'DELIVERED', icon: CheckCircle2 },
];

export default function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const res = await fetch(`/api/shipments/${id}`);
        if (res.ok) setShipment(await res.json());
      } catch (error) {
        toast.error('Failed to bind logistics node');
      } finally {
        setLoading(false);
      }
    };
    fetchShipment();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-card dark:bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-6 opacity-40">
        <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 animate-pulse">
          <Globe className="w-12 h-12 text-foreground dark:text-white animate-spin-slow" />
        </div>
        <p className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] italic">Indexing Global Node...</p>
      </div>
    </div>
  );

  if (!shipment) return (
    <div className="min-h-screen flex items-center justify-center bg-card dark:bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-6 opacity-40">
        <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10">
          <XCircle className="w-12 h-12 text-foreground dark:text-white" />
        </div>
        <p className="text-[10px] font-black text-foreground dark:text-white uppercase tracking-[0.4em] italic">Node Integrity Compromised</p>
      </div>
    </div>
  );

  const currentStepIndex = STEPS.findIndex(s => s.id === shipment.status);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
               <Link href="/dashboard/exporter/orders" className="size-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-5xl font-black text-foreground dark:text-white tracking-tighter uppercase italic">Signal Tracking</h1>
            <p className="text-muted-foreground/40 font-black text-[10px] uppercase tracking-[0.3em] mt-3 italic flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse dark:shadow-md shadow-none" />
              Node: {shipment.trackingNumber || 'PENDING_INDEX'} // SECURE_TRANSIT_LINK
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] italic dark:shadow-md shadow-none">
            {shipment.carrier || 'Global Carrier'}
          </div>
          <div className="px-6 py-3 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic">
            {shipment.status?.replace('_', ' ') || 'INITIALIZING'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left: Journey & Intel */}
        <div className="xl:col-span-8 space-y-10">
          {/* Journey Path */}
          <div className="bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 rounded-[3rem] p-12 relative overflow-hidden shadow-xl dark:shadow-2xl backdrop-blur-3xl group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
              <Globe className="w-80 h-80 text-foreground dark:text-white" />
            </div>

            <h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-16 italic">Logistics Journey Network</h2>

            <div className="relative flex justify-between items-start">
              {/* Vertical path for mobile/Horizontal for desktop */}
              <div className="absolute top-[31px] left-[5%] right-[5%] h-px bg-black/5 dark:bg-white/10 hidden md:block">
                <motion.div
                  className="h-full bg-primary dark:shadow-md shadow-none transition-all duration-1000"
                  initial={{ width: 0 }}
                  animate={{ width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-6">
                    <div className={`size-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 border ${isActive
                        ? 'bg-primary border-transparent text-primary-foreground dark:shadow-md shadow-none'
                        : 'bg-card/40 dark:bg-white/5 border-border dark:border-white/5 text-muted-foreground/20'
                      } ${isCurrent ? 'scale-125 ring-8 ring-white/10' : ''}`}>
                      <Icon className={`w-7 h-7 ${isCurrent ? 'animate-pulse' : ''}`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-[9px] font-black uppercase tracking-widest italic ${isActive ? 'text-foreground dark:text-white' : 'text-muted-foreground/20'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <motion.p
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[8px] text-foreground dark:text-white font-black mt-2 uppercase tracking-tighter"
                        >
                          ACTIVE_SIG
                        </motion.p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Neural Map Visual */}
          <div className="aspect-[21/8] rounded-[3rem] bg-card/60 dark:bg-white/[0.07] border border-border dark:border-white/5 relative overflow-hidden group shadow-inner backdrop-blur-xl">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 1000 400" className="stroke-white/30 fill-none">
                <path d="M100,250 Q300,100 500,250 T900,250" strokeWidth="1" strokeDasharray="5,5" />
                <circle cx="100" cy="250" r="3" fill="currentColor" />
                <circle cx="900" cy="250" r="3" fill="currentColor" />
                <motion.circle
                  r="5"
                  fill="#ffffff"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "65%" }} // Neural progress
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  style={{ offsetPath: "path('M100,250 Q300,100 500,250 T900,250')" }}
                />
              </svg>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white text-[9px] font-black uppercase tracking-[0.3em] italic animate-pulse">
                  Satellite Link: Active
                </div>
                <h3 className="text-muted-foreground/20 font-black text-[10px] uppercase tracking-[0.5em] italic">Transmitting Telemetry...</h3>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 p-6 bg-black/80 backdrop-blur-2xl border border-border dark:border-white/10 rounded-[2rem] flex items-center gap-6 shadow-xl dark:shadow-2xl hover:scale-105 transition-transform duration-500">
              <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                <Plane className="w-7 h-7 translate-x-0.5 -translate-y-0.5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic">Position Triangulation</p>
                <p className="text-foreground dark:text-white font-black text-lg italic uppercase tracking-tighter mt-1">North Atlantic Grid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Intel Hub */}
        <div className="xl:col-span-4 space-y-8">
          <div className="p-10 bg-card/40 dark:bg-white/5 border border-border dark:border-white/5 rounded-[3rem] shadow-xl dark:shadow-2xl backdrop-blur-3xl space-y-12">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Node Intelligence</h3>
              <div className="grid grid-cols-1 gap-5">
                {[
                  { l: 'Carrier Unit', v: shipment.carrier || 'Global Express', i: Anchor },
                  { l: 'ETA Window', v: 'MAR 24, 2026', i: Clock },
                  { l: 'Priority Level', v: 'Premium Node', i: ShieldCheck },
                ].map(item => (
                  <div key={item.l} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.02] border border-border dark:border-white/5 group hover:border-border dark:border-white/20 transition-all">
                    <div className="size-12 rounded-2xl bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <item.i className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic">{item.l}</p>
                      <p className="text-foreground dark:text-white font-black text-sm uppercase italic tracking-widest mt-1">{item.v}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 border-t border-border dark:border-white/5 space-y-6">
              <h3 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Validation Feed</h3>
              <div className="p-6 rounded-[2rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-start gap-5 group">
                <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <History className="w-6 h-6" />
                </div>
                <p className="text-[11px] text-muted-foreground font-black leading-relaxed italic uppercase tracking-wider mt-1 opacity-60">
                  "Package integrity verified at Primary Hub // Seals verified // Node stable."
                </p>
              </div>
            </div>

            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-16 rounded-[1.5rem] text-[10px] uppercase tracking-[0.3em] italic shadow-2xl shadow-white/5 active:scale-95 transition-all">
              Initialize Support Loop
            </Button>
          </div>

          <div className="p-8 rounded-[2rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-5">
              <ShieldCheck className="w-6 h-6 text-foreground dark:text-white group-hover:animate-pulse" />
              <p className="text-[9px] font-black text-foreground dark:text-white uppercase tracking-[0.2em] italic">Secure Transmission</p>
            </div>
            <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.1em]">AES-256_ACTIVE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
