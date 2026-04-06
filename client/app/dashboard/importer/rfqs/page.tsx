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
    <div className="space-y-8 animate-in fade-in duration-500 bg-background min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Sourcing Protocols</h1>
          <p className="text-muted-foreground mt-1 font-black text-[10px] uppercase tracking-widest leading-none">Manage your active sourcing requirements and exporter intelligence feed.</p>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-transparent h-12 px-8 rounded-xl gap-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/5 border border-border transition-all active:scale-95">
              <Plus className="w-4 h-4" /> Initialize Sourcing RFQ
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl text-foreground shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Broadcast Sourcing Protocol</DialogTitle>
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
                <div key={i} className="h-32 bg-muted/20 rounded-2xl animate-pulse border border-border" />
              ))}
            </div>
          ) : rfqs.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-3xl shadow-xl">
              <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-muted-foreground border border-border">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Transmission Node Vacant</h3>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest max-w-xs mx-auto mt-3 mb-10">
                Request custom intelligence from verified international resource nodes.
              </p>
              <Button onClick={() => setIsFormOpen(true)} className="bg-primary text-primary-foreground border-transparent hover:bg-primary/90 font-black text-[10px] uppercase tracking-[0.2em] h-11 px-8 rounded-xl shadow-xl">
                Create First Protocol
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {rfqs.map((rfq) => (
                <Link
                  key={rfq.id}
                  href={`/dashboard/importer/rfqs/${rfq.id}`}
                  className="group p-6 bg-muted/40 backdrop-blur-xl border border-border rounded-2xl hover:border-border shadow-xl transition-all block"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 block">
                        PROTOCOL: {rfq.category}
                      </span>
                      <h3 className="text-xl font-black text-foreground group-hover:text-muted-foreground transition-all uppercase italic tracking-tighter">
                        {rfq.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      EXPIRE: {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                      <Package className="w-3.5 h-3.5" />
                      {rfq.quantity} {rfq.unit}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-foreground ml-auto uppercase tracking-widest">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {rfq._count?.quotes || 0} Intelligence Logs
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-muted/20 border border-border rounded-2xl shadow-xl">
            <h4 className="text-foreground font-black uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2 italic">
              <AlertCircle className="w-4 h-4 text-foreground" />
              Sourcing Intelligence
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed italic font-black uppercase tracking-widest">
              Be specific about certifications (ISO, CE) to attract premium resource nodes.
            </p>
          </div>

          <div className="p-6 border border-border rounded-2xl bg-muted/40 shadow-xl">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 italic">Active Streams</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Open Requests</span>
                <span className="text-sm font-black text-foreground italic">{rfqs.filter(r => r.status === 'OPEN').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Logs</span>
                <span className="text-sm font-black text-foreground italic">
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
