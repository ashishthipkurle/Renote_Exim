'use client';

import React, { use, useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Package,
  History,
  Plane,
  Anchor,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const STEPS = [
  { id: 'PREPARING', label: 'Preparing', icon: Package },
  { id: 'IN_TRANSIT', label: 'In Transit', icon: Plane },
  { id: 'CUSTOMS', label: 'Customs', icon: ShieldCheck },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
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
        toast.error('Failed to load shipment details');
      } finally {
        setLoading(false);
      }
    };
    fetchShipment();
  }, [id]);

  if (loading) return <div className="p-8 text-white">Loading logistics data...</div>;
  if (!shipment) return <div className="p-8 text-white text-center">Shipment tracking not found</div>;

  const currentStepIndex = STEPS.findIndex(s => s.id === shipment.status);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/exporter/shipments" className="size-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Track Shipment</h1>
            <p className="text-slate-500 font-mono text-xs mt-1">Waybill: {shipment.trackingNumber || 'PENDING-LOGISTICS'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 text-xs font-black uppercase tracking-widest">
            {shipment.carrier || 'Standard Marine'}
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest">
            {shipment.status.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Timeline & Map */}
        <div className="lg:col-span-8 space-y-8">
          {/* Timeline Visual */}
          <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Globe className="w-64 h-64 text-white" />
             </div>
             
             <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-12">Logistics Journey</h2>
             
             <div className="relative flex justify-between items-start">
                {/* Horizontal line */}
                <div className="absolute top-[26px] left-[5%] right-[5%] h-[2px] bg-slate-800 hidden md:block">
                   <div 
                      className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-1000" 
                      style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                   />
                </div>

                {STEPS.map((step, idx) => {
                   const Icon = step.icon;
                   const isActive = idx <= currentStepIndex;
                   const isActual = idx === currentStepIndex;
                   
                   return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
                         <div className={`size-14 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                            isActive 
                            ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/20' 
                            : 'bg-slate-900 border-slate-800 text-slate-600'
                         } ${isActual ? 'scale-110 ring-4 ring-blue-500/20' : ''}`}>
                            <Icon className={`w-6 h-6 ${isActual ? 'animate-pulse' : ''}`} />
                         </div>
                         <div className="text-center">
                            <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-600'}`}>
                               {step.label}
                            </p>
                            {isActual && <p className="text-[10px] text-blue-500 font-bold mt-1">In Progress</p>}
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>

          {/* Mock Map Visual */}
          <div className="aspect-[21/9] rounded-[2.5rem] bg-slate-950 border border-white/5 relative overflow-hidden group shadow-inner">
             <div className="absolute inset-0 opacity-20 pointer-events-none">
                {/* Visual SVG dots/lines to simulate a map */}
                <svg width="100%" height="100%" viewBox="0 0 1000 400" className="stroke-blue-500/30 fill-none">
                   <path d="M100,200 Q300,50 500,200 T900,200" strokeWidth="2" strokeDasharray="10,10" />
                   <circle cx="100" cy="200" r="4" fill="currentColor" />
                   <circle cx="900" cy="200" r="4" fill="currentColor" />
                   {/* Animating dot */}
                   <motion.circle 
                     r="6" 
                     fill="#3b82f6" 
                     initial={{ offsetDistance: "0%" }}
                     animate={{ offsetDistance: "60%" }} // Mock 60% progress
                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                     style={{ offsetPath: "path('M100,200 Q300,50 500,200 T900,200')" }}
                   />
                </svg>
             </div>
             
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                      Live Transit Feed
                   </div>
                   <h3 className="text-slate-600 font-mono text-xs">Awaiting Satellite Link...</h3>
                </div>
             </div>

             <div className="absolute bottom-6 left-6 p-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4">
                <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                   <Plane className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Position</p>
                   <p className="text-white font-bold text-sm">North Atlantic Basin</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-8 bg-slate-900/50 border border-white/5 rounded-[2.5rem] space-y-8">
             <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Shipment Intelligence</h3>
                <div className="grid grid-cols-1 gap-4">
                   {[
                      { l: 'Carrier', v: shipment.carrier || 'Global Express', i: Anchor },
                      { l: 'Est. Delivery', v: 'March 24, 2026', i: Calendar },
                      { l: 'Service Level', v: 'Premium Air Freight', i: ShieldCheck },
                   ].map(item => (
                      <div key={item.l} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-950/50 border border-white/5 group hover:border-blue-500/20 transition-all">
                         <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                            <item.i className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.l}</p>
                            <p className="text-white font-bold text-sm">{item.v}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="pt-8 border-t border-white/5 space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Package Verified</h3>
                <div className="p-4 rounded-3xl bg-blue-600/5 border border-blue-500/10 flex items-center gap-4">
                   <div className="size-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                      <History className="w-6 h-6" />
                   </div>
                   <p className="text-xs text-blue-100/60 leading-relaxed italic">
                      "Package passed final inspection at Mumbai Hub. Seals intact."
                   </p>
                </div>
             </div>

             <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black h-14 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20">
                Contact Support
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
