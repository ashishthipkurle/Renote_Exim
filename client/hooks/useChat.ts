import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import axios from "axios";

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  orderId?: string | null;
  subject?: string | null;
};

export function useChat(otherUserId?: string | null, orderId?: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();

  const fetchMessages = useCallback(async () => {
    if (!otherUserId) return;
    try {
      const url = `/api/messaging?otherUserId=${otherUserId}${orderId ? `&orderId=${orderId}` : ""}`;
      const res = await axios.get(url);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  }, [otherUserId, orderId]);

  useEffect(() => {
    if (otherUserId) {
      fetchMessages();

      // Subscribe to real-time changes
      const channel = supabase
        .channel(`messages:${otherUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload: any) => {
            const newMessage = payload.new as Message;
            // Only add if it belongs to this conversation
            const isRelevant = 
              (newMessage.senderId === otherUserId || newMessage.receiverId === otherUserId) &&
              (!orderId || newMessage.orderId === orderId);
            
            if (isRelevant) {
              setMessages((prev) => [...prev, newMessage]);
              
              // If we are the receiver, mark as read
              if (newMessage.receiverId !== otherUserId) {
                 axios.patch("/api/messaging/read", { senderId: otherUserId }).catch(() => {});
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [otherUserId, orderId, fetchMessages, supabase]);

  const sendMessage = async (content: string, subject?: string) => {
    if (!otherUserId || !content.trim()) return;

    try {
      const res = await axios.post("/api/messaging", {
        receiverId: otherUserId,
        content,
        orderId,
        subject,
      });
      // Message will be added via real-time subscription or we can add it manually for optimistic UI
      return res.data;
    } catch (err) {
      console.error("Failed to send message", err);
      throw err;
    }
  };

  return { messages, loading, sendMessage, refresh: fetchMessages };
}
