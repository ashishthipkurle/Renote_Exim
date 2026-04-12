"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
 const searchParams = useSearchParams();
 const orderId = searchParams.get("orderId");

 return (
 <div className="min-h-[calc(100dvh-5rem)] bg-background flex items-center justify-center p-4">
 <div className="max-w-md w-full rounded-lg border border-border bg-card p-10 text-center space-y-6 shadow-xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
 
 <div className="relative z-10">
 <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-6">
 <CheckCircle2 className="h-10 w-10" />
 </div>
 
 <h1 className="text-3xl font-black tracking-tight mb-2">Payment Successful!</h1>
 <p className="text-muted-foreground">
 Your order has been placed and is being processed.
 </p>
 
 {orderId && (
 <div className="mt-6 p-4 rounded-lg bg-muted/40 font-mono text-sm">
 Order ID: <span className="font-bold">{orderId}</span>
 </div>
 )}
 
 <div className="pt-8 flex flex-col gap-4">
 <Button asChild className="w-full h-12 text-lg font-bold rounded-lg">
 <Link href="/dashboard/importer/orders">View My Orders</Link>
 </Button>
 <Button asChild variant="outline" className="w-full h-12 text-lg font-bold rounded-lg">
 <Link href="/products">Continue Shopping</Link>
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
}
