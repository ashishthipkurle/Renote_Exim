'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Plus, Clock, MessageSquare, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import RFQForm from '@/components/rfq/RFQForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ImporterRFQs() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchRFQs = async () => {
    try {
      const res = await fetch('/api/rfq');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRfqs(data);
    } catch (error) {
      toast.error('Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Your Custom RFQs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your active sourcing requirements and exporter quotes.</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-blue-500/10">
              <Plus className="w-4 h-4" /> New Sourcing RFQ
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-900 max-w-2xl text-slate-900 dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Post a Sourcing Requirement</DialogTitle>
            </DialogHeader>
            <RFQForm onSubmitSuccess={() => {
              setIsFormOpen(false);
              fetchRFQs();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900/50 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          ) : rfqs.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No active RFQs</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2 mb-8">
                Request custom quotes from verified international exporters.
              </p>
              <Button onClick={() => setIsFormOpen(true)} variant="outline" className="border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                Create First RFQ
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {rfqs.map((rfq) => (
                <Link 
                  key={rfq.id} 
                  href={`/dashboard/importer/rfqs/${rfq.id}`}
                  className="group p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500/50 dark:hover:border-blue-500/30 shadow-sm dark:shadow-none transition-all block"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-500 mb-2 block">
                        {rfq.category}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {rfq.title}
                      </h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      rfq.status === 'OPEN' ? 'border-green-500/20 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/5' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}>
                      {rfq.status}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-6 leading-relaxed">
                    {rfq.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Expires: {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium font-mono">
                      <Package className="w-3.5 h-3.5" />
                      {rfq.quantity} {rfq.unit}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-500 ml-auto">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {rfq._count?.quotes || 0} Quotes Received
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-blue-50 dark:bg-blue-600/5 border border-blue-200 dark:border-blue-500/20 rounded-2xl">
            <h4 className="text-slate-900 dark:text-white font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-500" />
              Sourcing Tip
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
              Be specific about certifications (ISO, CE, etc.) to attract higher quality exporters.
            </p>
          </div>
          
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 shadow-sm dark:shadow-none">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Active Sourcing</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Open Requests</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{rfqs.filter(r => r.status === 'OPEN').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Total Quotes</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {rfqs.reduce((acc, r) => acc + (r._count?.quotes || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
