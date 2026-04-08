import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAuth } from "@/components/auth/AuthProvider";
import axios from "axios";

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  orderId?: string | null;
  subject?: string | null;
};

export function useChat(otherUserId?: string | null, orderId?: string | null) {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();

  const fetchMessages = useCallback(async () => {
    if (!otherUserId) return;
    setLoading(true);
    try {
      const url = `/api/messaging?otherUserId=${otherUserId}${orderId ? `&orderId=${orderId}` : ""}&limit=80`;
      const res = await axios.get(url);
      setMessages(res.data);
      await axios.patch("/api/messaging/read", { senderId: otherUserId }).catch(() => {});
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  }, [otherUserId, orderId]);

  useEffect(() => {
    if (!otherUserId || !currentUser?.id) return;

    fetchMessages();

    // Listen only to new messages addressed to the current user.
    const channel = supabase
      .channel(`messages:incoming:${currentUser.id}:${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiverId=eq.${currentUser.id}`,
        },
        (payload: any) => {
          const newMessage = payload.new as Message;
          const isRelevant =
            newMessage.senderId === otherUserId &&
            (!orderId || newMessage.orderId === orderId);

          if (!isRelevant) return;

          setMessages((prev) => {
            if (prev.some((entry) => entry.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          axios.patch("/api/messaging/read", { senderId: otherUserId }).catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, otherUserId, orderId, fetchMessages, supabase]);

  const sendMessage = async (content: string, subject?: string) => {
    const value = content.trim();
    if (!otherUserId || !currentUser?.id || !value) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      senderId: currentUser.id,
      receiverId: otherUserId,
      body: value,
      createdAt: new Date().toISOString(),
      isRead: false,
      orderId: orderId || null,
      subject: subject || null,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await axios.post("/api/messaging", {
        receiverId: otherUserId,
        content: value,
        orderId,
        subject,
      });

      setMessages((prev) =>
        prev.map((message) => (message.id === optimisticId ? res.data : message))
      );

      return res.data;
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
      console.error("Failed to send message", err);
      throw err;
    }
  };

  return { messages, loading, sendMessage, refresh: fetchMessages };
}
