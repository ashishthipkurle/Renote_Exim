'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  MessageSquare, 
  AlertCircle, 
  ArrowRight, 
  Package, 
  FileText, 
  DollarSign, 
  ShieldCheck 
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
      toast.error('Failed to load RFQ marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  const filteredRfqs = activeTab === 'ALL' ? rfqs : rfqs.filter(r => r.category === activeTab);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Requirement Marketplace</h1>
          <p className="text-slate-400 mt-1">Browse and respond to custom sourcing requests from verified importers.</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            All Categories
          </button>
          {Array.from(new Set(rfqs.map(r => r.category))).map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredRfqs.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-3xl">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No active requirements found</h3>
          <p className="text-slate-400 max-w-xs mx-auto mt-2">Check back later for new sourcing opportunities in your category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRfqs.map((rfq) => (
            <div key={rfq.id} className="group flex flex-col bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-blue-500/30 transition-all overflow-hidden">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                    {rfq.category}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <Clock className="w-3 h-3" />
                    {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-tight">
                  {rfq.title}
                </h3>
                
                <p className="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {rfq.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800/50">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Quantity</p>
                    <p className="text-white font-bold">{rfq.quantity} {rfq.unit}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target</p>
                    <p className="text-green-500 font-bold">{rfq.budget ? `$${rfq.budget.toLocaleString()}` : 'Negotiable'}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950/40 border-t border-slate-800/50 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {rfq._count?.quotes || 0} Quotes
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Importer
                  </div>
                </div>
                
                <Link 
                  href={`/dashboard/exporter/rfqs/submit/${rfq.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl group/btn shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  Send Trade Quote <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="size-14 rounded-2xl bg-blue-600/20 flex items-center justify-center shrink-0">
          <AlertCircle className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Direct Response Protocol</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Verified exporters can submit binding quotes directly to importers. Quotes include pricing, lead times, and shipping terms. Ensure your profile is complete to increase acceptance rates.
          </p>
        </div>
        <Button variant="outline" className="ml-auto border-blue-500/30 text-blue-500 hover:bg-blue-500/10 h-12 px-6 rounded-xl font-bold">
          Market Intelligence
        </Button>
      </div>
    </div>
  );
}
