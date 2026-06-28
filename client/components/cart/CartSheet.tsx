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

export default function CartSheet({ customTrigger }: { customTrigger?: React.ReactNode } = {}) {
 const [items, setItems] = useState<CartItemType[]>([]);
 const [isOpen, setIsOpen] = useState(false);

 // In a real app, we'd fetch product details for these IDs
 // For now we'll just show the IDs or mock data if we had it
 
 useEffect(() => {
   if (isOpen) {
     setItems(getCart());
   }
 }, [isOpen]);

 useEffect(() => {
   const updateCart = () => setItems(getCart());
   window.addEventListener("renote-cart-updated", updateCart);
   // Also initialize cart on mount so badge is correct
   updateCart();
   return () => window.removeEventListener("renote-cart-updated", updateCart);
 }, []);

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
 {customTrigger ? customTrigger : (
   <Button variant="ghost" size="icon" className="relative group">
     <ShoppingCart className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
     {totalItems > 0 && (
       <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground font-black text-[10px] flex items-center justify-center rounded-full animate-in zoom-in shadow-lg">
         {totalItems}
       </span>
     )}
   </Button>
 )}
 </SheetTrigger>
 <SheetContent className="w-full sm:max-w-md bg-background border-border dark:border-white/5 p-0 flex flex-col backdrop-blur-3xl">
 <SheetHeader className="p-6 border-b border-border dark:border-white/5 bg-background/40">
 <div className="flex items-center justify-between">
 <SheetTitle className="text-foreground dark:text-white flex items-center gap-2 tracking-tighter uppercase font-black">
 <ShoppingBag className="w-5 h-5 text-primary" />
 Your Cart
 </SheetTitle>
 </div>
 </SheetHeader>

 <div className="flex-1 overflow-y-auto p-6">
 {items.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center p-6">
 <div className="w-16 h-16 bg-card dark:bg-white/5 border border-border dark:border-white/5 rounded-lg flex items-center justify-center mb-6 text-muted-foreground shadow-2xl">
 <ShoppingCart className="w-8 h-8 opacity-50" />
 </div>
 <h3 className="text-xl font-black text-foreground dark:text-white uppercase tracking-tighter mb-2">Cart is empty</h3>
 <p className="text-muted-foreground text-xs uppercase tracking-widest leading-relaxed max-w-[200px] mb-8 font-bold opacity-60">
 You haven't added any secondary port assets yet.
 </p>
 <Button asChild variant="outline" className="border-border dark:border-white/10 text-muted-foreground hover:text-foreground dark:hover:text-white rounded-xl shadow-lg">
 <Link href="/marketplace" onClick={() => setIsOpen(false)}>
 Browse Registry
 </Link>
 </Button>
 </div>
 ) : (
 <div className="space-y-6">
 {items.map((item) => (
 <div key={item.productId} className="flex gap-4 p-4 rounded-lg border border-border dark:border-white/5 bg-card/40 dark:bg-white/5 backdrop-blur-xl shadow-xl transition-all hover:-translate-y-1 hover:border-border dark:hover:border-white/10">
 <div className="w-20 h-20 bg-background dark:bg-black rounded-xl border border-border dark:border-white/5 flex-shrink-0 flex items-center justify-center shadow-inner">
 <ShoppingBag className="w-8 h-8 text-muted-foreground opacity-30" />
 </div>
 <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
 <div>
 <h4 className="text-foreground dark:text-white font-black tracking-tighter uppercase truncate mb-1 text-sm">
 Product {item.productId.slice(0, 8)}...
 </h4>
 <p className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest mb-3">Verified Exporter</p>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 bg-background dark:bg-black/50 rounded-lg p-1 border border-border dark:border-white/5">
 <button 
 onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
 className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground dark:hover:text-white bg-card dark:bg-white/5 rounded transition-all active:scale-95"
 >
 <Minus className="w-3 h-3" />
 </button>
 <span className="text-sm font-black text-foreground dark:text-white w-6 text-center ">{item.quantity}</span>
 <button 
 onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
 className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground dark:hover:text-white bg-card dark:bg-white/5 rounded transition-all active:scale-95"
 >
 <Plus className="w-3 h-3" />
 </button>
 </div>
 <button 
 onClick={() => handleRemove(item.productId)}
 className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10"
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
 <SheetFooter className="p-6 border-t border-border dark:border-white/5 bg-background/60 backdrop-blur-3xl">
 <div className="w-full space-y-4">
 <div className="flex items-center justify-between text-foreground dark:text-white font-black text-xl uppercase tracking-tighter">
 <span>Total Items</span>
 <span>{totalItems}</span>
 </div>
 <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-[0.2em] text-center">
 Transit logistics calculated at port departure
 </p>
 <div className="flex gap-2">
   <Button asChild variant="outline" className="flex-1 h-12 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-accent transition-all">
     <Link href="/cart" onClick={() => setIsOpen(false)}>
       View Cart
     </Link>
   </Button>
   <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">
     <Link href="/checkout" onClick={() => setIsOpen(false)}>
       Checkout
     </Link>
   </Button>
 </div>
 </div>
 </SheetFooter>
 )}
 </SheetContent>
 </Sheet>
 );
}
