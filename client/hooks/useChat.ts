import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
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

  const fetchMessages = useCallback(async () => {
    if (!otherUserId) return;
    setLoading(true);
    try {
      const url = "/api/messaging?otherUserId=" + otherUserId + (orderId ? "&orderId=" + orderId : "") + "&limit=80";
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

    const socket = getSocket();
    socket.emit("join-user-room", currentUser.id);

    const handleNewMessage = (payload: any) => {
      const newMessage = payload as Message;
      const isRelevant =
        newMessage.senderId === otherUserId &&
        (!orderId || newMessage.orderId === orderId);

      if (!isRelevant) return;

      setMessages((prev) => {
        if (prev.some((entry) => entry.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      axios.patch("/api/messaging/read", { senderId: otherUserId }).catch(() => {});
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [currentUser?.id, otherUserId, orderId, fetchMessages]);

  const sendMessage = async (content: string, subject?: string) => {
    const value = content.trim();
    if (!otherUserId || !currentUser?.id || !value) return;

    const optimisticId = "optimistic-" + Date.now();
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

      const confirmedMessage = res.data;

      setMessages((prev) =>
        prev.map((message) => (message.id === optimisticId ? confirmedMessage : message))
      );

      // Notify the receiver via WebSocket
      const socket = getSocket();
      socket.emit("send-message", confirmedMessage);

      // Also notify sender if they have multiple tabs open (optional)
      socket.emit("send-message", { ...confirmedMessage, receiverId: currentUser.id });

      return confirmedMessage;
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
      console.error("Failed to send message", err);
      throw err;
    }
  };

  return { messages, loading, sendMessage, refresh: fetchMessages };
}
