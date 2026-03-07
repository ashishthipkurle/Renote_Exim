"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/lib/contexts/SidebarContext";
import {
  Bell,
  Boxes,
  CreditCard,
  FolderTree,
  Globe,
  LayoutDashboard,
  LineChart,
  Package,
  Settings,
  User,
  Wallet,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const basePath = "/dashboard/exporter";

const nav = [
  { href: basePath, label: "Dashboard", icon: LayoutDashboard },
  { href: `${basePath}/inventory`, label: "Inventory", icon: Boxes },
  { href: `${basePath}/orders`, label: "Orders", icon: FolderTree },
  { href: `${basePath}/shipments`, label: "Shipments", icon: Globe },
  { href: `${basePath}/directory`, label: "Buyers", icon: Users },
  { href: `${basePath}/suppliers`, label: "Dealers", icon: Handshake },
  { href: `${basePath}/analytics`, label: "Analytics", icon: LineChart },
  { href: `${basePath}/finance`, label: "Finance", icon: Wallet },
  { href: `${basePath}/notifications`, label: "Notifications", icon: Bell },
];

function Item({
  href,
  label,
  icon: Icon,
  showBadge,
  isExpanded,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  showBadge?: boolean;
  isExpanded: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== basePath && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={
        `group relative flex items-center rounded-xl transition-all duration-300 h-11 w-full px-3 ` +
        (active
          ? "bg-primary text-white shadow-[0_0_15px_rgba(19,91,236,0.5)]"
          : "text-slate-400 hover:text-white hover:bg-white/5")
      }
    >
      <div className="relative flex-shrink-0">
        <Icon className="w-5 h-5" />
        {showBadge && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0b1019] shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="ml-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <div className="absolute left-14 bg-[#151c2a] border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[70] shadow-2xl">
          {label}
        </div>
      )}
    </Link>
  );
}

export default function ExporterSidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-24 h-dvh sticky top-0 bg-[#0b1019]/90 backdrop-blur-xl border-r border-white/5 z-50 flex-shrink-0 items-center py-6">
      {/* Logo */}
      <div className="mb-10 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
        <Package className="text-white w-6 h-6" />
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col gap-6 w-full items-center">
        {nav.map((n) => (
          <Item
            key={n.href}
            href={n.href}
            label={n.label}
            icon={n.icon}
            showBadge={n.label === "Notifications"}
          />
        ))}
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-4 items-center w-full">
        <Link
          href={`${basePath}/settings`}
          className="group relative w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-6 h-6" />
          <div className="absolute left-14 bg-[#151c2a] border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
            Settings
          </div>
        </Link>

        {/* User Info & Dropdown */}
        <div className="relative group flex justify-center w-full">
          <button className="flex h-12 w-12 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <User className="w-6 h-6" />
          </button>

          {/* Profile Dropdown Menu */}
          <div className="absolute left-14 bottom-0 ml-2 w-48 origin-bottom-left transform opacity-0 scale-95 transition-all duration-200 invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100 z-50">
            <div className="rounded-x1 border border-border bg-card p-1 shadow-lg">
              <div className="px-2 py-2 border-b border-border/60 mb-1">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await logout();
                    window.location.href = "/login";
                  } catch (error) {
                    console.error("Logout failed", error);
                  }
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
