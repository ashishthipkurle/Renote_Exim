"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

// ────────────────────────────────────────────────────────────────────────────
// NotificationBell
// Header icon with dynamic unread badge + dropdown toggle.
// ────────────────────────────────────────────────────────────────────────────

interface NotificationBellProps {
  /** Optional class to add to the outer wrapper */
  className?: string;
  /** Optional custom trigger element */
  customTrigger?: React.ReactNode;
}

export default function NotificationBell({ className = "", customTrigger }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications({
    limit: 10,
    pollInterval: 30000,
  });

  // ── Close on outside click ───────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ── Close on Escape ──────────────────────────────────────────────────
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Refresh notifications when the dropdown opens
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      refresh();
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {customTrigger ? (
        <div onClick={handleToggle} className="cursor-pointer">
          {customTrigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className={`
            relative size-9 rounded-full flex items-center justify-center
            text-muted-foreground transition-all active:scale-90
            border border-transparent
            ${isOpen
              ? "bg-primary/10 text-primary border-primary/20"
              : "hover:bg-primary/10 hover:text-primary hover:border-primary/20"
            }
          `}
        >
          <Bell className={`w-4 h-4 ${isOpen ? "" : "group-hover:animate-bounce"}`} />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span
              className="
                absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                flex items-center justify-center
                rounded-full bg-primary text-primary-foreground
                text-[10px] font-bold leading-none px-1
                shadow-lg shadow-primary/30
                animate-in zoom-in-75 duration-300
                ring-2 ring-background
              "
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          error={error}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
