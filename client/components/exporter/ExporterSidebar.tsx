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
  const { isExpanded } = useSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 240 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col h-[calc(100dvh-80px)] sticky top-20 bg-[#0b1019]/60 backdrop-blur-xl border-r border-white/5 z-[60] flex-shrink-0 pt-0 pb-0"
      >
        {/* Nav */}
        <div className="flex-1 flex flex-col gap-0.5 w-full items-center pt-1 px-2">
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

        {/* Bottom Section (Settings Only) */}
        <div className={`flex flex-col gap-0 items-center w-full pb-2 border-t border-white/5 px-2 pt-2`}>
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
