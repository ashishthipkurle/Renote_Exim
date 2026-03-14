'use client';

import React, { useState } from 'react';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCart, clearCart } from '@/lib/cart';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const cart = getCart();

  if (cart.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
        <Button onClick={() => router.push('/marketplace')} className="bg-blue-600">
          Go to Marketplace
        </Button>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    toast.info('Processing international trade transaction...');
    setTimeout(() => {
      clearCart();
      setStep(4);
      toast.success('Order placed successfully!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Progress Stepper */}
        <div className="mb-12 flex items-center justify-between max-w-2xl mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step >= s ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border-slate-800 text-slate-500'
              }`}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-24 h-0.5 mx-4 ${step > s ? 'bg-blue-600' : 'bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-white">Shipping Information</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm text-slate-400">Company Name</label>
                    <input className="w-full bg-slate-900 border-slate-800 rounded-xl h-12 px-4 shadow-inner" placeholder="Acme Corp" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">First Name</label>
                    <input className="w-full bg-slate-900 border-slate-800 rounded-xl h-12 px-4 shadow-inner" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Last Name</label>
                    <input className="w-full bg-slate-900 border-slate-800 rounded-xl h-12 px-4 shadow-inner" placeholder="Doe" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm text-slate-400">Full Address</label>
                    <input className="w-full bg-slate-900 border-slate-800 rounded-xl h-12 px-4 shadow-inner" placeholder="123 Trade St, Port City" />
                  </div>
                </div>
                <Button onClick={() => setStep(2)} className="w-full h-14 bg-blue-600 rounded-xl font-bold gap-2">
                  Continue to Billing <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-white">Payment Method</h2>
                </div>
                <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-2xl flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Stripe Secure Payment</p>
                      <p className="text-blue-300 text-xs italic">Encrypted international gateway</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white" />
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 border-slate-800 text-slate-300 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-2 h-14 bg-blue-600 rounded-xl font-bold px-12">
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-white">Review & Confirm</h2>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-white font-bold pb-4 border-b border-slate-800">Order Summary</h3>
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center text-slate-300">
                      <span>Product {item.productId.slice(0, 8)} x {item.quantity}</span>
                      <span className="font-mono">$ --</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-white font-bold text-xl">
                    <span>Grand Total</span>
                    <span className="text-blue-500">$ --</span>
                  </div>
                </div>
                <Button onClick={handlePlaceOrder} className="w-full h-14 bg-blue-600 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/10">
                  Confirm Trade Order
                </Button>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-20 space-y-6 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 mb-8 border border-green-500/20 shadow-2xl shadow-green-500/10">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tight">Trade Confirmed!</h2>
                <p className="text-slate-400 text-lg max-w-md mx-auto">
                  Your order has been sent to the exporter. You'll receive real-time updates in your dashboard.
                </p>
                <div className="flex gap-4 justify-center mt-12">
                  <Button onClick={() => router.push('/dashboard/importer/orders')} className="bg-white text-slate-950 hover:bg-slate-100 font-bold px-8 h-12 rounded-xl">
                    Track Order
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/marketplace')} className="border-slate-800 text-slate-300 font-bold px-8 h-12 rounded-xl">
                    Back to Marketplace
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          {step < 4 && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Trade Assurance
                </h4>
                <p className="text-[13px] text-slate-400 leading-relaxed italic">
                  Renote Exim protects your payments until the goods are delivered and verified.
                </p>
              </div>
              <div className="p-6 border border-slate-800 rounded-2xl border-dashed">
                <h4 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-4">Support</h4>
                <p className="text-sm text-slate-300">Need help with this trade?</p>
                <Link href="/contact" className="text-blue-500 text-sm font-medium hover:underline block mt-2">
                  Chat with an agent
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
