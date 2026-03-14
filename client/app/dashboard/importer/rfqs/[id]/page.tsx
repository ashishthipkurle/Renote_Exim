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

  if (loading) return <div className="p-8 text-white">Loading RFQ details...</div>;
  if (!rfq) return <div className="p-8 text-white text-center">RFQ not found</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/importer/rfqs" className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">{rfq.title}</h1>
          <p className="text-slate-400 text-sm">RFQ ID: {rfq.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className={`ml-auto px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
          rfq.status === 'OPEN' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-slate-700 text-slate-500'
        }`}>
          {rfq.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* RFQ Details */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" /> Specifications
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              {rfq.description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</p>
                <p className="text-white font-bold">{rfq.quantity} {rfq.unit}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deadline</p>
                <p className="text-white font-bold">{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'None'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</p>
                <p className="text-blue-500 font-bold">{rfq.category}</p>
              </div>
            </div>
          </div>

          {/* Quotes Received */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" /> Received Quotes ({quotes.length})
            </h2>
            
            {quotes.length === 0 ? (
              <div className="py-20 bg-slate-950/50 border border-slate-900 border-dashed rounded-3xl text-center">
                <p className="text-slate-500 italic">No quotes received yet. Exporters are reviewing your request.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div key={quote.id} className={`p-6 bg-slate-900/40 border rounded-3xl transition-all ${
                    quote.status === 'ACCEPTED' ? 'border-green-500/30' : 'border-slate-800'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden ring-2 ring-white/5">
                          {quote.exporter?.avatar ? (
                            <img src={quote.exporter.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{quote.exporter?.companyName || quote.exporter?.name}</p>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{quote.exporter?.country}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-8">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Price</p>
                          <p className="text-2xl font-black text-green-500">${quote.price.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lead Time</p>
                          <p className="text-lg font-black text-white">{quote.leadTime} Days</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:ml-auto">
                        {quote.status === 'PENDING' && rfq.status === 'OPEN' ? (
                          <>
                            <Button 
                              onClick={() => handleQuoteAction(quote.id, 'ACCEPTED')}
                              disabled={!!processingId}
                              className="bg-green-600 hover:bg-green-500 text-white h-11 px-6 rounded-xl font-bold gap-2"
                            >
                              <Check className="w-4 h-4" /> Accept
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleQuoteAction(quote.id, 'REJECTED')}
                              disabled={!!processingId}
                              className="border-slate-800 text-slate-400 hover:text-white h-11 px-4 rounded-xl font-bold"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border ${
                            quote.status === 'ACCEPTED' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-slate-700 text-slate-500'
                          }`}>
                            {quote.status}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {quote.note && (
                      <div className="mt-6 p-4 bg-slate-950/50 rounded-2xl border border-white/5 text-sm text-slate-400 italic">
                        "{quote.note}"
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
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-2xl shadow-blue-500/10 relative overflow-hidden group">
            <ShieldCheck className="w-12 h-12 text-white/20 absolute -top-2 -right-2 rotate-12" />
            <h3 className="text-xl font-black text-white leading-tight mb-4">Trade Assurance</h3>
            <p className="text-blue-100/80 text-sm leading-relaxed mb-6">
              When you accept a quote, the platform secures your trade with verification and escrow-like protections.
            </p>
            <div className="space-y-3">
              {['Verified Exporters', 'Payment Protection', 'Escrow Support'].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs font-bold text-white">
                  <div className="size-4 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 border border-slate-800 bg-slate-900/50 rounded-3xl space-y-6">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Support</h4>
            <Button variant="outline" className="w-full border-slate-800 text-slate-300 h-12 rounded-xl font-bold gap-2">
              <MessageSquare className="w-4 h-4" /> Contact Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
