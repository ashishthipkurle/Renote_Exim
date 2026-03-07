"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Users,
  Handshake,
  ChevronRight,
  ChevronLeft,
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
  { href: `${basePath}/finance`, label: "Finance", icon: CreditCard },
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
  const { user } = useAuth();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 240 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col h-dvh sticky top-0 bg-[#0b1019]/90 backdrop-blur-xl border-r border-white/5 z-[60] flex-shrink-0 items-center py-6 overflow-hidden"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-20 w-6 h-6 bg-primary rounded-full border-2 border-[#0b1019] flex items-center justify-center text-white hover:scale-110 transition-transform z-[70] shadow-lg shadow-primary/20"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Logo */}
        <div className={`mb-10 flex items-center transition-all duration-300 ${isExpanded ? "w-full px-6 justify-start" : "w-10 h-10 justify-center"}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
            <Package className="text-white w-5 h-5" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 text-lg font-black text-white whitespace-nowrap"
              >
                RANOTE <span className="text-primary">EXIM</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div className="flex-1 flex flex-col gap-2 w-full items-center overflow-y-auto no-scrollbar pb-6 px-3">
          {nav.map((n) => (
            <Item
              key={n.href}
              href={n.href}
              label={n.label}
              icon={n.icon}
              showBadge={n.label === "Notifications"}
              isExpanded={isExpanded}
            />
          ))}
        </div>

        {/* Bottom */}
        <div className={`flex flex-col gap-4 items-center w-full pt-6 border-t border-white/5 px-3`}>
          <Link
            href={`${basePath}/settings`}
            className={`group relative flex items-center rounded-xl transition-all duration-300 h-11 w-full px-3 ${pathname === `${basePath}/settings`
              ? "bg-primary text-white"
              : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
            {!isExpanded && (
              <div className="absolute left-14 bg-[#151c2a] border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[70] shadow-2xl">
                Settings
              </div>
            )}
          </Link>

          <div className={`flex items-center w-full transition-all duration-300 ${isExpanded ? "px-1 justify-start" : "justify-center"}`}>
            <div className="w-10 h-10 rounded-full border-2 border-white/5 overflow-hidden cursor-pointer hover:border-primary transition-colors flex items-center justify-center bg-slate-800 text-slate-400 flex-shrink-0">
              {user?.avatar ? (
                <Image
                  alt="User"
                  width={40} height={40}
                  className="w-full h-full object-cover"
                  src={user.avatar as string}
                  unoptimized
                />
              ) : (
                <User className="size-5" />
              )}
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3 overflow-hidden"
                >
                  <p className="text-[11px] font-bold text-white truncate max-w-[120px]">{user?.name || "Exporter"}</p>
                  <p className="text-[9px] text-slate-500 truncate max-w-[120px]">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0b1019]/95 backdrop-blur-xl border-t border-white/5 z-[100] grid grid-cols-5 items-center px-2">
        {nav.slice(0, 4).map((n) => {
          const active = pathname === n.href || (n.href !== basePath && pathname.startsWith(n.href + "/"));
          return (
            <Link key={n.href} href={n.href} className="flex flex-col items-center justify-center gap-1 h-full relative">
              <n.icon className={`w-5 h-5 ${active ? "text-primary" : "text-slate-500"}`} />
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${active ? "text-primary" : "text-slate-500"}`}>{n.label === "Dashboard" ? "Home" : n.label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" />}
            </Link>
          );
        })}
        {/* Menu Link (simplified for space) */}
        <div className="group flex flex-col items-center justify-center gap-1 h-full relative border-l border-white/5">
          <div className="relative">
            <Handshake className={`w-5 h-5 ${pathname.includes('/suppliers') ? 'text-primary' : 'text-slate-500'}`} />
            <Link href={`${basePath}/suppliers`} className="absolute inset-0 z-10" />
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-tighter ${pathname.includes('/suppliers') ? 'text-primary' : 'text-slate-500'}`}>Dealers</span>
          {pathname.includes('/suppliers') && <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" />}
        </div>
      </div>
    </>
  );
}
