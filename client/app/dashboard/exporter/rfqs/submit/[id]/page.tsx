'use client';

import React, { useState, useEffect, use } from 'react';
import { 
  ArrowLeft, 
  DollarSign, 
  Clock, 
  Calendar, 
  FileText, 
  Send, 
  ShieldCheck, 
  Info,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rfqId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rfq, setRfq] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    price: '',
    leadTime: '',
    validUntil: '',
    terms: 'FOB',
    note: '',
  });

  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        const res = await fetch(`/api/rfq/${rfqId}`);
        if (res.ok) setRfq(await res.json());
      } catch (error) {
        toast.error('Failed to load RFQ');
      }
    };
    fetchRFQ();
  }, [rfqId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId,
          ...formData
        }),
      });

      if (!res.ok) throw new Error('Failed to submit quote');
      
      toast.success('Quote submitted successfully!');
      router.push('/dashboard/exporter/rfqs');
    } catch (error) {
      toast.error('Failed to submit quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!rfq) return <div className="p-8 text-white">Loading requirement...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/exporter/rfqs" className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Submit Trade Quote</h1>
          <p className="text-slate-400 mt-1">Responding to: <span className="text-blue-400 font-medium">{rfq.title}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Price ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    required
                    type="number"
                    className="w-full bg-slate-950 border-slate-800 rounded-2xl h-14 pl-12 pr-4 text-white focus:border-blue-500/50 outline-none transition-all"
                    placeholder="e.g. 15000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Lead Time (Days)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    required
                    type="number"
                    className="w-full bg-slate-950 border-slate-800 rounded-2xl h-14 pl-12 pr-4 text-white focus:border-blue-500/50 outline-none transition-all"
                    placeholder="e.g. 15"
                    value={formData.leadTime}
                    onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Valid Until</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-950 border-slate-800 rounded-2xl h-14 pl-12 pr-4 text-white focus:border-blue-500/50 outline-none transition-all"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Shipping Terms</label>
                <select
                  className="w-full bg-slate-950 border-slate-800 rounded-2xl h-14 px-4 text-white focus:border-blue-500/50 outline-none transition-all"
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                >
                  <option value="FOB">FOB (Free on Board)</option>
                  <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                  <option value="EXW">EXW (Ex Works)</option>
                  <option value="DDP">DDP (Delivered Duty Paid)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Additional Notes</label>
              <textarea
                rows={4}
                className="w-full bg-slate-950 border-slate-800 rounded-2xl p-4 text-white focus:border-blue-500/50 outline-none transition-all resize-none"
                placeholder="Include details about packing, quality assurance, or logistics..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white h-16 rounded-2xl font-bold text-lg gap-2 shadow-xl shadow-blue-500/20"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Submitting Quote...' : 'Submit Formal Quote'}
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Requirement Summary</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="w-4 h-4 text-blue-500 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Wanted Quantity</p>
                  <p className="text-white font-bold">{rfq.quantity} {rfq.unit}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-blue-500 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Budget</p>
                  <p className="text-green-500 font-bold">{rfq.budget ? `$${rfq.budget.toLocaleString()}` : 'Not Specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300 leading-relaxed italic">
              Once submitted, your quote will be visible to the importer and cannot be edited. Ensure all terms are final.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
