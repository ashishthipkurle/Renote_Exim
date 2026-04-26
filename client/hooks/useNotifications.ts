"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { authFetch } from "@/lib/api-utils";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  ownerId: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  link: string | null;
  linkedEntityId: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseNotificationsOptions {
  /** Number of notifications to fetch. Default: 10 */
  limit?: number;
  /** Polling interval in ms. Default: 30000 (30s). Set to 0 to disable. */
  pollInterval?: number;
  /** Whether to start fetching immediately. Default: true */
  enabled?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────────────────

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { limit = 10, pollInterval = 30000, enabled = true } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch notifications ──────────────────────────────────────────────
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const data = await authFetch<NotificationsResponse>(
        `/api/notifications?limit=${limit}`
      );
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      // Don't overwrite data on polling errors — just flag the error
      if (!silent) setError(err.message || "Failed to fetch notifications");
      console.error("[useNotifications] fetch error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [limit]);

  // ── Fetch unread count only (lightweight) ────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await authFetch<{ unreadCount: number }>(
        `/api/notifications?countOnly=true`
      );
      setUnreadCount(data.unreadCount);
    } catch (err) {
      // Silently fail — badge is non-critical
    }
  }, []);

  // ── Mark single notification as read (optimistic) ────────────────────
  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await authFetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ ids: [id] }),
      });
    } catch {
      // Revert on failure
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // ── Mark all as read (optimistic) ────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await authFetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAll: true }),
      });
    } catch {
      // Revert on failure
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // ── Manual refresh ───────────────────────────────────────────────────
  const refresh = useCallback(() => fetchNotifications(false), [fetchNotifications]);

  // ── Initial fetch ────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    fetchNotifications(false);
  }, [enabled, fetchNotifications]);

  // ── Polling ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || pollInterval <= 0) return;

    intervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, pollInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, pollInterval, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
