"use client";

import React from "react";
import { CheckCheck, Bell, Loader2, InboxIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import NotificationRow from "./NotificationRow";
import type { Notification } from "@/hooks/useNotifications";

// ────────────────────────────────────────────────────────────────────────────
// NotificationDropdown
// ────────────────────────────────────────────────────────────────────────────

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();
  const { user } = useAuth();

  const notificationsHref =
    user?.role === "IMPORTER"
      ? "/dashboard/importer/notifications"
      : user?.role === "ADMIN"
        ? "/dashboard/admin/notifications"
        : "/dashboard/exporter/notifications";

  const handleNavigate = (link: string) => {
    onClose();
    router.push(link);
  };

  return (
    <div
      className="
        absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)]
        rounded-xl border border-border dark:border-white/10
        bg-background/95 dark:bg-background/98
        backdrop-blur-xl shadow-2xl shadow-black/20
        animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200
        z-50 overflow-hidden
      "
      role="dialog"
      aria-label="Notifications"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tabular-nums">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="
              inline-flex items-center gap-1.5 text-xs font-semibold
              text-primary hover:text-primary/80 transition-colors
              active:scale-95
            "
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="max-h-[400px] overflow-y-auto overscroll-contain custom-scrollbar">
        {loading && notifications.length === 0 ? (
          /* Loading skeleton */
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="size-9 rounded-lg bg-muted/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted/60" />
                  <div className="h-2.5 w-full rounded bg-muted/40" />
                  <div className="h-2 w-1/4 rounded bg-muted/30" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div className="py-12 px-4 text-center">
            <div className="size-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-xs font-semibold text-destructive mb-1">
              Something went wrong
            </p>
            <p className="text-[11px] text-muted-foreground">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty state */
          <div className="py-14 px-4 text-center select-none">
            <div className="size-16 mx-auto rounded-2xl bg-muted/30 dark:bg-white/5 border border-border/50 dark:border-white/10 flex items-center justify-center mb-4">
              <InboxIcon className="w-7 h-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground/60 mb-1">
              All caught up!
            </p>
            <p className="text-xs text-muted-foreground/40">
              No new notifications right now.
            </p>
          </div>
        ) : (
          /* Notification list */
          notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onRead={onMarkAsRead}
              onNavigate={handleNavigate}
            />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      {notifications.length > 0 && (
        <div className="border-t border-border/50 dark:border-white/5">
          <button
            type="button"
            onClick={() => handleNavigate(notificationsHref)}
            className="
              w-full py-3 text-xs font-bold text-primary
              hover:bg-primary/5 transition-colors
              active:scale-[0.98]
            "
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
