"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatWindow from "./ChatWindow";

interface OrderContactProps {
 orderId: string;
 receiverId: string;
 receiverName: string;
}

export default function OrderContact({ orderId, receiverId, receiverName }: OrderContactProps) {
 const [isOpen, setIsOpen] = useState(false);

 return (
 <>
 <Button 
 onClick={() => setIsOpen(true)}
 className="w-full flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl py-6"
 >
 <MessageSquare className="h-4 w-4" />
 Message Buyer
 </Button>

 {isOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="w-full max-w-2xl h-[600px] bg-background rounded-lg overflow-hidden shadow-2xl border border-border flex flex-col relative animate-in fade-in zoom-in duration-300">
 <button 
 onClick={() => setIsOpen(false)}
 className="absolute top-4 right-4 z-[110] p-2 bg-card/80 backdrop-blur-md rounded-full border border-border hover:bg-muted transition-colors"
 >
 <X className="h-4 w-4" />
 </button>
 <div className="flex-1 overflow-hidden">
 <ChatWindow 
 otherUserId={receiverId} 
 orderId={orderId} 
 />
 </div>
 </div>
 </div>
 )}
 </>
 );
}
