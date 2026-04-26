"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

export interface ChatMessage {
 id: string;
 content: string;
 senderId: string;
 senderName: string;
 senderImage: string | null;
 timestamp: string;
}

interface LiveChatPanelProps {
 messages: ChatMessage[];
 currentUserId: string;
 onSendMessage: (content: string) => void;
 disabled?: boolean;
 isConnected?: boolean;
}

export function LiveChatPanel({
 messages,
 currentUserId,
 onSendMessage,
 disabled = false,
 isConnected = true,
}: LiveChatPanelProps) {
 const [message, setMessage] = useState("");
 const [isSending, setIsSending] = useState(false);
 const messagesEndRef = useRef<HTMLDivElement>(null);

 // Auto-scroll to bottom on new messages
 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 const handleSend = () => {
 if (!message.trim() || disabled) return;

 setIsSending(true);
 onSendMessage(message.trim());
 setMessage("");

 // Brief delay for UX
 setTimeout(() => setIsSending(false), 100);
 };

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === "Enter" && !e.shiftKey) {
 e.preventDefault();
 handleSend();
 }
 };

 return (
 <div className="flex flex-col h-full bg-card/60 backdrop-blur-3xl border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
 {/* Header */}
 <div className="p-4 border-b border-border/50 bg-muted/20">
 <div className="flex items-center justify-between">
 <h3 className="font-black text-xs uppercase tracking-widest text-primary">Live Negotiation Chat</h3>
 <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-full border border-border/50">
 <span
 className={`size-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-destructive"
 }`}
 />
 <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
 {isConnected ? "Connected" : "Reconnecting..."}
 </span>
 </div>
 </div>
 </div>

 {/* Messages */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
 {messages.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
 <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
 <Send className="size-6 text-primary" />
 </div>
 <p className="text-[10px] font-black uppercase tracking-widest">No messages yet</p>
 <p className="text-[9px] font-medium mt-1">
 Start the conversation!
 </p>
 </div>
 ) : (
 messages.map((msg) => {
 const isOwn = msg.senderId === currentUserId;
 const initials = msg.senderName
 .split(" ")
 .map((n) => n[0])
 .join("")
 .toUpperCase()
 .slice(0, 2);

 return (
 <div
 key={msg.id}
 className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
 >
 <Avatar className="size-8 shrink-0 border border-border/50">
 <AvatarImage src={msg.senderImage || undefined} />
 <AvatarFallback className="text-[10px] font-bold bg-muted">
 {initials}
 </AvatarFallback>
 </Avatar>
 <div
 className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isOwn
 ? "bg-primary text-primary-foreground rounded-tr-none"
 : "bg-muted/50 backdrop-blur-sm border border-border/50 rounded-tl-none"
 }`}
 >
 {!isOwn && (
 <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">
 {msg.senderName}
 </p>
 )}
 <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
 {msg.content}
 </p>
 <p
 className={`text-[9px] font-bold mt-2 tracking-tighter ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
 }`}
 >
 {format(new Date(msg.timestamp), "HH:mm")}
 </p>
 </div>
 </div>
 );
 })
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input */}
 <div className="p-4 border-t border-border/50 bg-muted/10">
 <div className="flex gap-3 items-end">
 <div className="flex-1 relative">
 <Textarea
 placeholder={disabled ? "Chat disabled" : "Type a message..."}
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 onKeyDown={handleKeyDown}
 disabled={disabled}
 className="min-h-[44px] max-h-[120px] resize-none bg-background/50 border-border/50 rounded-xl px-4 py-3 text-sm focus-visible:ring-primary/30"
 />
 </div>
 <Button
 onClick={handleSend}
 disabled={disabled || isSending || !message.trim()}
 size="icon"
 className="size-11 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
 >
 {isSending ? (
 <Loader2 className="size-4 animate-spin" />
 ) : (
 <Send className="size-4" />
 )}
 </Button>
 </div>
 </div>
 </div>
 );
}
