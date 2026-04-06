'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Clock,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Globe,
  Layers,
  TrendingUp,
  Package,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ExporterRFQs() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchRFQs = async () => {
    try {
      const res = await fetch('/api/rfq');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRfqs(data);
    } catch (error) {
      toast.error('Null_Source_Telemetry: Failed to index requirement nodes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  const filteredRfqs = activeTab === 'ALL' ? rfqs : rfqs.filter(r => r.category === activeTab);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* ── Header ── */}
      <header className="flex-shrink-0 px-10 py-10 border-b border-border dark:border-white/5 bg-background/40 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground dark:text-white uppercase italic">Requirement Feed</h1>
            <p className="text-muted-foreground/40 mt-3 text-[10px] font-black uppercase tracking-[0.3em] italic">
              Registry Node Index: ACTIVE_SOURCING_PROTOCOLS // Verified Importer Requests
            </p>
          </div>

          <div className="flex bg-black/5 dark:bg-white/10 p-1.5 rounded-2xl border border-border dark:border-white/10 backdrop-blur-3xl">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'ALL' ? 'bg-primary text-primary-foreground shadow-xl dark:shadow-2xl' : 'text-muted-foreground/40 hover:text-foreground dark:text-white'}`}
            >
              All Signals
            </button>
            {Array.from(new Set(rfqs.map(r => r.category))).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic ${activeTab === cat ? 'bg-primary text-primary-foreground shadow-xl dark:shadow-2xl' : 'text-muted-foreground/40 hover:text-foreground dark:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-16 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="max-w-[1700px] mx-auto space-y-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-card/40 dark:bg-white/5 rounded-[2.5rem] animate-pulse border border-border dark:border-white/5" />
              ))}
            </div>
          ) : filteredRfqs.length === 0 ? (
            <div className="bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[3rem] p-24 text-center">
              <div className="flex flex-col items-center gap-8 opacity-40">
                <div className="p-10 rounded-[2.5rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10">
                  <Search className="w-16 h-16 text-foreground dark:text-white" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Null_Requirement_Index</h2>
                  <p className="text-[10px] text-foreground dark:text-white font-black uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed italic">
                    Market registry query returned no active requirement nodes. Await incoming signals or refresh telemetry.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredRfqs.map((rfq) => (
                <div key={rfq.id} className="group flex flex-col bg-card/40 dark:bg-white/5 backdrop-blur-3xl border border-border dark:border-white/5 hover:border-border dark:border-white/20 transition-all duration-700 shadow-xl dark:shadow-2xl rounded-[2.5rem] overflow-hidden hover:-translate-y-2">
                  <div className="p-10 flex-1 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                      <Layers className="w-32 h-32 text-foreground dark:text-white" />
                    </div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <span className="px-5 py-2 rounded-full bg-black/5 dark:bg-white/10 text-foreground dark:text-white text-[9px] font-black uppercase tracking-widest border border-border dark:border-white/10 italic">
                        {rfq.category} // SEC_NODE
                      </span>
                      <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest italic bg-black/5 dark:bg-white/10 px-4 py-2 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-white/20" />
                        {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'SIG_CONTINUOUS'}
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-foreground dark:text-white mb-4 italic tracking-tighter uppercase group-hover:translate-x-1 transition-transform">
                      {rfq.title}
                    </h3>

                    <p className="text-muted-foreground/40 text-xs font-medium line-clamp-3 mb-10 leading-relaxed italic group-hover:text-muted-foreground/80 transition-colors uppercase tracking-tight">
                      {rfq.description}
                    </p>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border dark:border-white/5 relative z-10">
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground/10 uppercase tracking-[0.3em] mb-3 italic">Asset_Quantity</p>
                        <p className="text-foreground dark:text-white font-black text-lg italic tracking-widest uppercase">{rfq.quantity} {rfq.unit}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-muted-foreground/10 uppercase tracking-[0.3em] mb-3 italic">Max_Yield_USD</p>
                        <p className="text-foreground dark:text-white font-black text-lg italic tracking-widest uppercase">{rfq.budget ? `$${rfq.budget.toLocaleString()}` : 'NEGOTIABLE'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 bg-white/[0.02] border-t border-border dark:border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest italic group-hover:text-foreground dark:text-white transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        {rfq._count?.quotes || 0} Telemetry Quotes Sent
                      </div>
                      <div className="flex items-center gap-3 text-foreground dark:text-white font-black text-[9px] uppercase tracking-widest italic bg-black/5 dark:bg-white/10 px-4 py-2 rounded-full">
                        <ShieldCheck className="w-4 h-4" /> NODE_VERIFIED
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/exporter/rfqs/submit/${rfq.id}`}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-[0.3em] h-14 rounded-2xl group/btn shadow-xl dark:shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 italic"
                    >
                      Initialize Trade Quote <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-card/60 dark:bg-white/[0.07] backdrop-blur-3xl border border-border dark:border-white/10 rounded-[3rem] p-12 flex flex-col xl:flex-row items-center gap-10 shadow-xl dark:shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-6 transition-transform duration-1000">
              <Zap className="w-40 h-40 text-foreground dark:text-white" />
            </div>
            <div className="size-20 rounded-[2rem] bg-black/5 dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center shrink-0 relative z-10">
              <AlertCircle className="w-10 h-10 text-foreground dark:text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-foreground dark:text-white font-black text-2xl uppercase italic tracking-tighter mb-4">Direct Response Protocol</h3>
              <p className="text-muted-foreground/40 text-xs font-medium leading-relaxed max-w-3xl italic uppercase tracking-tight group-hover:text-muted-foreground/80 transition-colors">
                Verified procurement nodes can relay binding financial signatures directly to importers. Quotes include verified pricing telemetry, logistic lead times, and global trade terms. Multi-node synchronization increases acceptance probability.
              </p>
            </div>
            <button className="xl:ml-auto border border-border dark:border-white/10 text-foreground dark:text-white hover:bg-primary hover:text-primary-foreground h-16 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] italic transition-all active:scale-95 shadow-xl dark:shadow-2xl relative z-10">
              Intel_Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
