"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Minus, Send, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import HomeNavbar from "@/components/homepage/HomeNavbar";

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  originCountry: string;
};

type QuoteItem = {
  product: Product;
  quantity: number;
};

export default function QuotationClient({
  products,
  isLoggedIn,
  user,
}: {
  products: Product[];
  isLoggedIn: boolean;
  user: { name: string; email: string; businessName?: string } | null;
}) {
  const router = useRouter();
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const updateQuantity = (product: Product, delta: number) => {
    setQuoteItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter((item) => item.product.id !== product.id);
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }
      if (delta > 0) {
        return [...prev, { product, quantity: delta }];
      }
      return prev;
    });
  };

  const getQuantity = (productId: string) => {
    const item = quoteItems.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleRequestQuote = () => {
    if (quoteItems.length === 0) return;

    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    let message = `Hello Ranote Exim,`;
    
    if (user) {
      const clientName = user.name || "A client";
      const businessInfo = user.businessName ? ` from ${user.businessName}` : "";
      message += `%0A%0AThis is ${clientName}${businessInfo} (${user.email}).`;
    }

    message += "%0AI would like to request a quotation for the following products:%0A%0A";
    
    quoteItems.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} (Qty: ${item.quantity})%0A`;
    });
    
    message += "%0APlease provide the best possible rates.";

    // In a real application, you would send `message` to your backend API here
    // which would then use the WhatsApp Business API to send it to the admin.
    
    setShowSuccessModal(true);
    setQuoteItems([]);
  };

  return (
    <>
      <HomeNavbar />
      <div className="pt-8 pb-16 px-4 lg:px-8 w-full max-w-[1600px] mx-auto min-h-screen">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-muted hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Request a Quotation</h1>
            <p className="text-muted-foreground mt-1">Select products and quantities to request a bulk quote.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">
          {/* Left Sidebar: Categories */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-28">
              <h3 className="font-headline font-semibold text-[10px] uppercase tracking-wider text-muted-foreground mb-4 pl-2">Categories</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex items-center flex-shrink-0 text-left px-3 py-2.5 rounded-lg transition-all group ${!selectedCategory ? "bg-primary/5 text-primary font-bold shadow-sm" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-muted/50 hover:text-primary"}`}
                >
                  <span className="material-symbols-outlined mr-3 text-[20px]">auto_awesome</span>
                  <span className="font-headline font-semibold text-sm uppercase tracking-tight">All Products</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center flex-shrink-0 text-left px-3 py-2.5 rounded-lg transition-all group ${selectedCategory === cat ? "bg-primary/5 text-primary font-bold shadow-sm" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-muted/50 hover:text-primary"}`}
                  >
                    <span className="material-symbols-outlined mr-3 text-[20px]">category</span>
                    <span className="font-headline font-semibold text-sm uppercase tracking-tight">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Products Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-card rounded-xl border border-border">
                <p className="text-muted-foreground">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border-t border-l border-border/50 bg-white dark:bg-card rounded-md">
                {filteredProducts.map((product) => {
                  const qty = getQuantity(product.id);
                  const image = product.images?.[0] ?? null;
                  return (
                    <div
                      key={product.id}
                      className="group relative p-3 hover:shadow-md transition-shadow duration-300 border-r border-b border-border/50 flex flex-col h-full bg-white dark:bg-card"
                    >
                      {/* Wishlist Heart */}
                      <div className="absolute top-2 right-2 z-10 cursor-pointer p-1 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-sm hover:bg-red-50 transition-colors">
                        <span className="material-symbols-outlined text-gray-400 hover:text-red-500 transition-colors text-[20px] md:text-[22px]">favorite_border</span>
                      </div>
                      
                      {/* Card Image */}
                      <div className="relative mb-2 overflow-hidden bg-transparent aspect-square flex items-center justify-center">
                        {image ? (
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            sizes="(max-width:640px) 100vw,(max-width:1280px) 50vw,33vw"
                            className="object-contain transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                            <span className="material-symbols-outlined text-6xl">inventory_2</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <p className="text-[10px] md:text-[11px] text-[#2874f0] dark:text-blue-400 font-semibold mb-1">#BestSeller</p>

                      {/* Body */}
                      <div className="flex flex-col flex-grow">
                        <h2 className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground/90 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {product.name}
                        </h2>
                        
                        <div className="flex items-center gap-1 mt-1.5">
                          <div className="flex items-center text-[#388e3c]">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="material-symbols-outlined text-[12px] md:text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-sm md:text-base font-bold text-foreground">
                            ${product.price}
                          </span>
                        </div>
                        
                        <div className="mt-2 mb-4">
                          <span className="inline-block text-[8px] md:text-[9px] font-bold text-[#388e3c] bg-[#388e3c]/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            Hot Deal
                          </span>
                        </div>
                        
                        <div className="mt-auto pt-2">
                          {qty === 0 ? (
                            <button
                              onClick={() => updateQuantity(product, 1)}
                              className="w-full py-2 rounded border border-primary/20 text-primary font-semibold hover:bg-primary hover:text-white transition-colors text-xs"
                            >
                              Add to Quote
                            </button>
                          ) : (
                            <div className="flex items-center justify-between bg-primary/10 rounded p-1 border border-primary/20">
                              <button
                                onClick={() => updateQuantity(product, -1)}
                                className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-background text-foreground hover:bg-muted transition-colors shadow-sm"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-sm w-8 text-center">{qty}</span>
                              <button
                                onClick={() => updateQuantity(product, 1)}
                                className="w-8 h-8 flex items-center justify-center rounded bg-white dark:bg-background text-foreground hover:bg-muted transition-colors shadow-sm"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Quotation List */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-28 bg-card border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Your Quotation List
              </h2>

              {quoteItems.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">Your quote list is empty. Add products to request a bulk quote.</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {quoteItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-start gap-3 pb-3 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">{item.product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-medium text-primary">Qty: {item.quantity}</p>
                          <span className="text-xs text-muted-foreground">·</span>
                          <p className="text-xs text-muted-foreground">${item.product.price} / ea</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.product, -item.quantity)}
                        className="text-xs text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                disabled={quoteItems.length === 0}
                onClick={handleRequestQuote}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                Submit Quotation Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-center text-foreground mb-3">Authentication Required</h3>
            <p className="text-center text-muted-foreground mb-8 text-sm">
              You must be logged in or signed up to request a quotation. This ensures our team can reach out to you properly.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login?callbackUrl=/quotation"
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-center hover:bg-primary/90 transition-colors"
              >
                Login / Sign Up
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full bg-transparent border border-border text-foreground font-semibold py-3.5 rounded-xl text-center hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-center text-foreground mb-3">Inquiry Sent!</h3>
            <p className="text-center text-muted-foreground mb-8 text-sm leading-relaxed">
              Our admin team has received your quotation request and will connect with you shortly through a call or message for further processing.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-center hover:bg-primary/90 transition-colors"
            >
              Okay, Thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
