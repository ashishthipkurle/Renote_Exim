'use client';

import React, { useState } from 'react';
import { Send, FileText, Package, Calendar, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Requirement Title</label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              required
              className="w-full bg-slate-900 border-slate-800 rounded-xl h-12 pl-11 pr-4 text-white focus:border-blue-500/50 transition-all outline-none"
              placeholder="e.g. 5000 units of organic cotton yarn"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Category</label>
            <select
              className="w-full bg-slate-900 border-slate-800 rounded-xl h-12 px-4 text-white outline-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Deadline</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="date"
                className="w-full bg-slate-900 border-slate-800 rounded-xl h-12 pl-11 pr-4 text-white outline-none"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Quantity</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                required
                className="w-full bg-slate-900 border-slate-800 rounded-xl h-12 pl-11 pr-4 text-white outline-none"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Target Budget ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="number"
                className="w-full bg-slate-900 border-slate-800 rounded-xl h-12 pl-11 pr-4 text-white outline-none"
                placeholder="Optional"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Detailed Specifications</label>
          <textarea
            required
            rows={4}
            className="w-full bg-slate-900 border-slate-800 rounded-xl p-4 text-white outline-none focus:border-blue-500/50 transition-all resize-none"
            placeholder="Describe your requirements in detail (materials, packing, shipping terms)..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300 leading-relaxed italic">
            This RFQ will be sent to verified exporters in the {formData.category.toLowerCase()} category. 
            They will submit quotes directly to your dashboard.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
      >
        <Send className="w-4 h-4" />
        {loading ? 'Submitting...' : 'Post RFQ to Marketplace'}
      </Button>
    </form>
  );
}
