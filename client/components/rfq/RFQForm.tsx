'use client';

import React, { useState } from 'react';
import { Send, FileText, Package, Calendar, DollarSign, Info } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  'CHEMICALS', 'MACHINES', 'TEXTILES', 'MEDICAL', 
  'HANDICRAFTS', 'FOOD', 'ELECTRONICS', 'AGRICULTURE'
];

export default function RFQForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TEXTILES',
    quantity: 1,
    unit: 'Units',
    budget: '',
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to submit RFQ');
      
      toast.success('RFQ submitted successfully!');
      onSubmitSuccess?.();
    } catch (error) {
      toast.error('Failed to submit RFQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Requirement Signature</label>
          <div className="relative group">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-white transition-colors" />
            <input
              required
              className="w-full bg-muted/20 border border-border rounded-xl h-12 pl-11 pr-4 text-white focus:border-white/20 focus:bg-muted/40 transition-all outline-none placeholder:text-muted-foreground/30 font-medium italic"
              placeholder="e.g. 5000 units of organic cotton yarn"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Asset Node Class</label>
            <div className="relative group">
              <select
                className="w-full bg-muted/20 border border-border rounded-xl h-12 px-4 text-white outline-none focus:border-white/20 focus:bg-muted/40 transition-all appearance-none font-medium italic"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(c => <option key={c} value={c} className="bg-black text-white">{c}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 border-r-2 border-b-2 border-muted-foreground/20 rotate-45 pointer-events-none group-focus-within:border-white transition-colors" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Deadline Protocol</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-white transition-colors" />
              <input
                type="date"
                className="w-full bg-muted/20 border border-border rounded-xl h-12 pl-11 pr-4 text-white outline-none focus:border-white/20 focus:bg-muted/40 transition-all font-medium"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Volume Metric</label>
            <div className="relative group">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-white transition-colors" />
              <input
                type="number"
                required
                className="w-full bg-muted/20 border border-border rounded-xl h-12 pl-11 pr-4 text-white outline-none focus:border-white/20 focus:bg-muted/40 transition-all font-medium"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Capital Threshold (USD)</label>
            <div className="relative group">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-white transition-colors" />
              <input
                type="number"
                className="w-full bg-muted/20 border border-border rounded-xl h-12 pl-11 pr-4 text-white outline-none placeholder:text-muted-foreground/30 focus:border-white/20 focus:bg-muted/40 transition-all font-medium"
                placeholder="Optional"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Intelligence Briefing</label>
          <textarea
            required
            rows={4}
            className="w-full bg-muted/20 border border-border rounded-xl p-4 text-white outline-none focus:border-white/20 focus:bg-muted/40 transition-all resize-none placeholder:text-muted-foreground/30 font-medium italic leading-relaxed"
            placeholder="Describe your requirements in detail (materials, packing, shipping terms)..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-4 shadow-inner">
          <Info className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.1em] leading-relaxed opacity-60">
            This RFQ will be broadcast to verified exporter nodes in the {formData.category.toUpperCase()} sector. 
            Quotes will be transmitted directly to your procurement dashboard.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white hover:bg-neutral-200 text-black h-14 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-white/10 transition-all hover:-translate-y-1 active:translate-y-0 text-[10px] disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Transmitting Protocol...' : 'Broadcast Requirement to Market'}
      </button>
    </form>
  );
}
