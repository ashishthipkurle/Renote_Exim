"use client";

import React from "react";
import {
  Package,
  Truck,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Phone,
  PhoneOff,
  PhoneMissed,
  Clock,
  Bell,
  AlertTriangle,
  CreditCard,
  Megaphone,
} from "lucide-react";
import { timeAgo } from "@/lib/api-utils";
import type { Notification } from "@/hooks/useNotifications";

// ────────────────────────────────────────────────────────────────────────────
// Type → Icon + Color mapping
// ────────────────────────────────────────────────────────────────────────────

function getNotificationMeta(type: string) {
  switch (type) {
    case "ORDER_UPDATE":
      return {
        icon: Package,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      };
    case "SHIPMENT_UPDATE":
      return {
        icon: Truck,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      };
    case "MESSAGE_RECEIVED":
      return {
        icon: MessageSquare,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
      };
    case "VERIFICATION_OUTCOME":
      return {
        icon: ShieldCheck,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      };
    case "CALL_SCHEDULED":
      return {
        icon: Phone,
        color: "text-sky-500",
        bg: "bg-sky-500/10",
      };
    case "CALL_ACCEPTED":
      return {
        icon: Phone,
        color: "text-green-500",
        bg: "bg-green-500/10",
      };
    case "CALL_REJECTED":
      return {
        icon: PhoneOff,
        color: "text-red-400",
        bg: "bg-red-400/10",
      };
    case "CALL_REMINDER":
      return {
        icon: Clock,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
      };
    case "MISSED_CALL":
      return {
        icon: PhoneMissed,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
      };
    case "PAYMENT_RECEIVED":
      return {
        icon: DollarSign,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
      };
    case "PAYMENT_FAILED":
      return {
        icon: CreditCard,
        color: "text-red-500",
        bg: "bg-red-500/10",
      };
    case "ADMIN_BROADCAST":
      return {
        icon: Megaphone,
        color: "text-primary",
        bg: "bg-primary/10",
      };
    default:
      return {
        icon: Bell,
        color: "text-muted-foreground",
        bg: "bg-muted/30",
      };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// NotificationRow
// ────────────────────────────────────────────────────────────────────────────

interface NotificationRowProps {
  notification: Notification;
  onRead: (id: string) => void;
  onNavigate: (link: string) => void;
}

export default function NotificationRow({
  notification,
  onRead,
  onNavigate,
}: NotificationRowProps) {
  const { icon: Icon, color, bg } = getNotificationMeta(notification.type);

  const handleClick = () => {
    // Mark as read first
    if (!notification.read) {
      onRead(notification.id);
    }
    // Then navigate if there's a link
    if (notification.link) {
      onNavigate(notification.link);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        w-full text-left flex items-start gap-3 px-4 py-3.5 
        transition-all duration-200 group cursor-pointer
        hover:bg-accent/60 active:scale-[0.995]
        border-b border-border/30 last:border-b-0
        ${!notification.read
          ? "bg-primary/[0.04] dark:bg-primary/[0.06]"
          : "bg-transparent"
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex-shrink-0 size-9 rounded-lg flex items-center justify-center
          transition-transform duration-200 group-hover:scale-110
          ${bg} ${color}
        `}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-sm font-semibold truncate ${
              notification.read
                ? "text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {notification.title}
          </span>
          {!notification.read && (
            <span className="flex-shrink-0 size-2 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(var(--primary),0.4)]" />
          )}
        </div>
        <p
          className={`text-xs leading-relaxed line-clamp-2 ${
            notification.read
              ? "text-muted-foreground/50"
              : "text-muted-foreground"
          }`}
        >
          {notification.message}
        </p>
        <time
          className="text-[10px] font-medium text-muted-foreground/40 mt-1 block"
          dateTime={notification.createdAt}
        >
          {timeAgo(notification.createdAt)}
        </time>
      </div>
    </button>
  );
}
