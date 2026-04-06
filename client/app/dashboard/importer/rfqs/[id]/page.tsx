'use client';

import React, { useEffect, useState, use } from 'react';
import {
  ArrowLeft,
  Clock,
  Package,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
  DollarSign,
  User,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function RFQDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [rfq, setRfq] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [rfqRes, quotesRes] = await Promise.all([
        fetch(`/api/rfq/${id}`),
        fetch(`/api/quotes?rfqId=${id}`)
      ]);

      if (rfqRes.ok) setRfq(await rfqRes.json());
      if (quotesRes.ok) setQuotes(await quotesRes.json());
    } catch (error) {
      toast.error('Failed to load RFQ data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleQuoteAction = async (quoteId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setProcessingId(quoteId);
    try {
      const res = await fetch('/api/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quoteId, status }),
      });

      if (!res.ok) throw new Error('Action failed');

      toast.success(status === 'ACCEPTED' ? 'Quote accepted! Check your orders.' : 'Quote rejected.');
      fetchData(); // Refresh data
      if (status === 'ACCEPTED') {
        const data = await res.json();
        router.push(`/dashboard/importer/orders/${data.orderId}`);
      }
    } catch (error) {
      toast.error('Failed to process quote');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-8 text-foreground">Loading RFQ details...</div>;
  if (!rfq) return <div className="p-8 text-foreground text-center">RFQ not found</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-6 border-b border-border pb-8">
        <Link href="/dashboard/importer/rfqs" className="size-12 rounded-2xl bg-muted/20 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:border-border shadow-xl">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">{rfq.title}</h1>
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] mt-1.5 opacity-60">RESOURCE NODE: {rfq.id.slice(0, 12).toUpperCase()}</p>
        </div>
        <div className={`ml-auto px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-xl ${rfq.status === 'OPEN' ? 'border-border text-foreground bg-muted/20 animate-pulse' : 'border-border text-muted-foreground bg-muted/20'
          }`}>
          {rfq.status} PROTOCOL
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* RFQ Details */}
          <div className="bg-muted/40 backdrop-blur-xl border border-border rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-sm font-black text-foreground mb-8 flex items-center gap-3 uppercase italic tracking-tighter">
              <Info className="w-5 h-5 text-foreground/40" /> Technical Specifications
            </h2>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.1em] leading-relaxed mb-10 opacity-70 italic">
              &ldquo;{rfq.description}&rdquo;
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Quantity Matrix</p>
                <p className="text-foreground font-black text-lg italic tracking-tighter">{rfq.quantity} {rfq.unit}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Temporal Deadline</p>
                <p className="text-foreground font-black text-lg italic tracking-tighter">{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'INDETERMINATE'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Market Category</p>
                <p className="text-foreground font-black text-lg italic tracking-tighter uppercase">{rfq.category}</p>
              </div>
            </div>
          </div>

          {/* Quotes Received */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-foreground flex items-center gap-3 uppercase italic tracking-tighter">
              <MessageSquare className="w-5 h-5 text-foreground/40" /> Transmission Logs ({quotes.length})
            </h2>

            {quotes.length === 0 ? (
              <div className="py-24 bg-muted/20 border border-border border-dashed rounded-[2.5rem] text-center shadow-inner">
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] italic opacity-40">Awaiting vendor broadcast trace...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {quotes.map((quote) => (
                  <div key={quote.id} className={`p-8 bg-muted/40 backdrop-blur-xl border rounded-[2.5rem] transition-all shadow-2xl ${quote.status === 'ACCEPTED' ? 'border-border bg-muted/20' : 'border-border'
                    }`}>
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                      <div className="flex items-center gap-5">
                        <div className="size-16 rounded-[1.5rem] bg-muted border border-border flex items-center justify-center text-muted-foreground/30 overflow-hidden shadow-xl">
                          {quote.exporter?.avatar ? (
                            <img src={quote.exporter.avatar} alt="" className="w-full h-full object-cover grayscale opacity-80" />
                          ) : (
                            <User className="w-8 h-8" />
                          )}
                        </div>
                        <div>
                          <p className="text-foreground font-black text-xl italic tracking-tighter uppercase">{quote.exporter?.companyName || quote.exporter?.name}</p>
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60">{quote.exporter?.country} · VERIFIED ORIGIN</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-10">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Valuation</p>
                          <p className="text-3xl font-black text-foreground italic tracking-tighter">${quote.price.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Latency</p>
                          <p className="text-xl font-black text-foreground italic tracking-tighter">{quote.leadTime} DAYS</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {quote.status === 'PENDING' && rfq.status === 'OPEN' ? (
                          <>
                            <Button
                              onClick={() => handleQuoteAction(quote.id, 'ACCEPTED')}
                              disabled={!!processingId}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground border-transparent h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/5 active:scale-95 transition-all"
                            >
                              <Check className="w-4 h-4" /> Initialize
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleQuoteAction(quote.id, 'REJECTED')}
                              disabled={!!processingId}
                              className="border-border text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 h-14 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-xl ${quote.status === 'ACCEPTED' ? 'border-border text-foreground bg-muted/20' : 'border-border text-muted-foreground bg-muted/20'
                            }`}>
                            {quote.status} LOGGED
                          </div>
                        )}
                      </div>
                    </div>

                    {quote.note && (
                      <div className="mt-6 p-4 bg-muted/20 backdrop-blur-xl rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground italic leading-relaxed">
                        &ldquo;{quote.note}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Exporter Trust Card */}
          <div className="bg-muted/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
            <ShieldCheck className="w-16 h-16 text-foreground/5 absolute -top-4 -right-4 rotate-12" />
            <h3 className="text-xl font-black text-foreground italic tracking-tighter mb-4 uppercase">Trade Integrity</h3>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest leading-relaxed mb-8 opacity-60">
              Platform-level secure node verification and liquidated escrow protocols.
            </p>
            <div className="space-y-4">
              {['Verified Exporters', 'Protocol Protection', 'Escrow Support'].map(item => (
                <div key={item} className="flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-[0.2em]">
                  <div className="size-5 rounded-lg bg-muted/20 border border-border flex items-center justify-center shadow-xl">
                    <Check className="w-3 h-3 text-foreground" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 border border-border bg-muted/40 backdrop-blur-xl rounded-[2.5rem] space-y-6 shadow-2xl">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Operational Support</h4>
            <Button variant="outline" className="w-full border-border bg-muted/20 hover:bg-muted/30 text-foreground h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all">
              <MessageSquare className="w-4 h-4" /> Dispatch Signal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
