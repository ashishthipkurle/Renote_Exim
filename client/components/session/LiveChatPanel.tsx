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
 <div className="flex flex-col h-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl">
 {/* Header */}
 <div className="p-4 border-b border-[var(--color-border)]">
 <div className="flex items-center justify-between">
 <h3 className="font-semibold text-[var(--color-foreground)]">Chat</h3>
 <div className="flex items-center gap-2">
 <span
 className={`size-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"
 }`}
 />
 <span className="text-xs text-muted-foreground">
 {isConnected ? "Connected" : "Reconnecting..."}
 </span>
 </div>
 </div>
 </div>

 {/* Messages */}
 <div className="flex-1 overflow-y-auto p-4 space-y-4">
 {messages.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-center">
 <p className="text-muted-foreground text-sm">No messages yet</p>
 <p className="text-xs text-muted-foreground mt-1">
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
 className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
 >
 <Avatar className="size-8 shrink-0">
 <AvatarImage src={msg.senderImage || undefined} />
 <AvatarFallback className="text-xs">
 {initials}
 </AvatarFallback>
 </Avatar>
 <div
 className={`max-w-[80%] rounded-lg p-3 ${isOwn
 ? "bg-[var(--color-primary)] text-white"
 : "bg-[var(--color-muted)]"
 }`}
 >
 {!isOwn && (
 <p className="text-xs font-medium mb-1 opacity-70">
 {msg.senderName}
 </p>
 )}
 <p className="text-sm whitespace-pre-wrap break-words">
 {msg.content}
 </p>
 <p
 className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-muted-foreground"
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
 <div className="p-4 border-t border-[var(--color-border)]">
 <div className="flex gap-2">
 <Textarea
 placeholder={disabled ? "Chat disabled" : "Type a message..."}
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 onKeyDown={handleKeyDown}
 disabled={disabled}
 className="min-h-[50px] max-h-[100px] resize-none"
 />
 <Button
 onClick={handleSend}
 disabled={disabled || isSending || !message.trim()}
 size="icon"
 className="h-auto"
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
