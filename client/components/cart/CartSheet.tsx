'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { getCart, removeFromCart, updateQuantity, CartItem as CartItemType, clearCart } from '@/lib/cart';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CartSheet() {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // In a real app, we'd fetch product details for these IDs
  // For now we'll just show the IDs or mock data if we had it
  
  useEffect(() => {
    if (isOpen) {
      setItems(getCart());
    }
  }, [isOpen]);

  const handleUpdateQuantity = (id: string, q: number) => {
    updateQuantity(id, q);
    setItems(getCart());
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setItems(getCart());
    toast.success('Item removed from cart');
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <ShoppingCart className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] flex items-center justify-center rounded-full animate-in zoom-in">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-slate-950 border-slate-900 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-slate-900">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
              Your Cart
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 text-slate-500">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cart is empty</h3>
              <p className="text-slate-500 text-sm max-w-[200px] mb-8">
                Looks like you haven't added any international products yet.
              </p>
              <Button asChild variant="outline" className="border-slate-800 text-slate-300">
                <Link href="/marketplace" onClick={() => setIsOpen(false)}>
                  Browse Marketplace
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-900 rounded-xl border border-slate-800 flex-shrink-0 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-slate-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate mb-1">
                      Product {item.productId.slice(0, 8)}...
                    </h4>
                    <p className="text-slate-500 text-xs mb-3">Verified Exporter</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm text-white w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.productId)}
                        className="text-slate-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-6 border-t border-slate-900 bg-slate-950/50">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-white font-bold text-lg">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest text-center">
                Shipping and taxes calculated at checkout
              </p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl">
                <Link href="/checkout" onClick={() => setIsOpen(false)}>
                  Proceed to Checkout
                </Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
