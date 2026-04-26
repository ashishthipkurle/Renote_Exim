"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Search, User } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSocket } from "@/lib/socket";

type Conversation = {
 otherUser: {
 id: string;
 name: string | null;
 avatar: string | null;
 role: string;
 };
 lastMessage: {
 body: string;
 createdAt: string;
 senderId: string;
 } | null;
 unreadCount: number;
};

interface ConversationListProps {
 selectedUserId: string | null;
 onSelect: (userId: string) => void;
}

export default function ConversationList({ selectedUserId, onSelect }: ConversationListProps) {
 const { user } = useAuth();
 const [conversations, setConversations] = useState<Conversation[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");

 const fetchConversations = useCallback(async () => {
 try {
 const res = await axios.get("/api/messaging?limit=50");
 setConversations(res.data);
 } catch (err) {
 console.error("Failed to fetch conversations", err);
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchConversations();
 }, [fetchConversations]);

 useEffect(() => {
 if (!user?.id) return;

 const socket = getSocket();
 socket.emit("join-user-room", user.id);

 const handleNewMessage = () => {
 fetchConversations();
 };

 socket.on("new-message", handleNewMessage);

 return () => {
 socket.off("new-message", handleNewMessage);
 };
 }, [fetchConversations, user?.id]);

 const filtered = conversations.filter(c => 
 c.otherUser.name?.toLowerCase().includes(search.toLowerCase()) ||
 c.otherUser.role.toLowerCase().includes(search.toLowerCase())
 );

 return (
 <div className="flex flex-col h-full bg-card border-r border-border">
 <div className="p-4 space-y-4">
 <h2 className="text-xl font-black">Messages</h2>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <input
 type="text"
 placeholder="Search conversations..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
 />
 </div>
 </div>

 <div className="flex-1 overflow-y-auto">
 {loading ? (
 <div className="p-8 text-center text-muted-foreground text-sm">Loading chats...</div>
 ) : filtered.length === 0 ? (
 <div className="p-8 text-center text-muted-foreground text-sm">No conversations found.</div>
 ) : (
 <div className="divide-y divide-border">
 {filtered.map((conv) => {
 const isSelected = selectedUserId === conv.otherUser.id;
 const lastMsg = conv.lastMessage;
 
 return (
 <button
 key={conv.otherUser.id}
 onClick={() => onSelect(conv.otherUser.id)}
 className={`w-full flex items-center gap-3 p-4 transition-colors text-left ${
 isSelected ? "bg-primary/5" : "hover:bg-muted/50"
 }`}
 >
 <div className="relative h-12 w-12 flex-shrink-0">
 {conv.otherUser.avatar ? (
 <Image
 src={conv.otherUser.avatar}
 alt={conv.otherUser.name || "User"}
 fill
 className="rounded-full object-cover border border-border"
 />
 ) : (
 <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-primary border border-border">
 <User className="h-6 w-6" />
 </div>
 )}
 {conv.unreadCount > 0 && (
 <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-black text-white flex items-center justify-center border-2 border-card shadow-sm">
 {conv.unreadCount}
 </div>
 )}
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-baseline gap-2">
 <p className="font-bold truncate text-sm">
 {conv.otherUser.name || "Anonymous User"}
 </p>
 {lastMsg && (
 <span className="text-[10px] text-muted-foreground whitespace-nowrap">
 {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false })}
 </span>
 )}
 </div>
 <p className="text-[10px] uppercase font-black tracking-widest text-primary/70 mb-1">
 {conv.otherUser.role}
 </p>
 <p className={`text-xs truncate ${conv.unreadCount > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
 {lastMsg ? lastMsg.body : "Start a conversation"}
 </p>
 </div>
 </button>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
}
