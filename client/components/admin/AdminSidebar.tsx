"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  Boxes,
  FolderTree,
  Globe,
  LayoutDashboard,
  LineChart,
  Package,
  Settings,
  User,
  Users,
  Rss,
  TrendingUp,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSidebar } from "@/lib/contexts/SidebarContext";
import { motion, AnimatePresence } from "framer-motion";

const nav = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/products", label: "Products", icon: Package },
  { href: "/dashboard/admin/orders", label: "Orders", icon: Boxes },
  { href: "/dashboard/admin/shipments", label: "Shipments", icon: FolderTree },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/dashboard/admin/categories", label: "Categories", icon: LayoutGrid },
  { href: "/dashboard/admin/feed", label: "Activity Feed", icon: Rss },
  { href: "/dashboard/admin/trends", label: "Market Trends", icon: TrendingUp },
  { href: "/dashboard/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/admin/directory", label: "Directory", icon: Globe },
];

function Item({
  href,
  label,
  icon: Icon,
  isExpanded,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  isExpanded: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard/admin" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={
        "group relative flex items-center rounded-xl transition-all duration-300 h-11 w-full px-3 " +
        (active
          ? "bg-primary text-white shadow-[0_0_15px_rgba(19,91,236,0.5)]"
          : "text-slate-400 hover:text-white hover:bg-white/5")
      }
    >
      <div className="relative flex-shrink-0">
        <Icon className="w-5 h-5" />
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

export default function AdminSidebar() {
  const { user } = useAuth();
  const { isExpanded, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden lg:flex flex-col h-dvh sticky top-0 bg-[#0b1019]/90 backdrop-blur-xl border-r border-white/5 z-50 flex-shrink-0 pt-6 pb-4"
    >
      <div className="flex flex-col items-center w-full px-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
          <Package className="text-white w-6 h-6" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 w-full px-3 overflow-y-auto custom-scrollbar">
        {nav.map((n) => (
          <Item key={n.href} href={n.href} label={n.label} icon={n.icon} isExpanded={isExpanded} />
        ))}
      </div>

      <div className="flex flex-col gap-2 items-center w-full px-3 pt-4 border-t border-white/5">
        <button
          onClick={toggleSidebar}
          className="group relative flex items-center rounded-xl transition-all duration-300 h-11 w-full px-3 text-slate-400 hover:text-white hover:bg-white/5"
        >
          {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          {isExpanded && <span className="ml-3 text-[11px] font-bold uppercase tracking-wider">Collapse</span>}
        </button>

        <Link
          href="/dashboard/settings"
          className={
            "group relative flex items-center rounded-xl transition-all duration-300 h-11 w-full px-3 " +
            (pathname === "/dashboard/settings"
              ? "bg-primary text-white"
              : "text-slate-400 hover:text-white hover:bg-white/5")
          }
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

        <div className="flex items-center gap-3 w-full px-3 py-2 mt-2">
          <div className="size-8 rounded-full border border-white/10 overflow-hidden bg-slate-800 flex-shrink-0">
            {user?.avatar ? (
              <Image
                alt="User"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                src={user.avatar as string}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
          {isExpanded && (
            <div className="flex flex-col min-w-0">
              <p className="text-[10px] font-bold text-white truncate uppercase tracking-wider">{user?.name || "Admin"}</p>
              <p className="text-[8px] font-medium text-slate-500 truncate uppercase mt-0.5">System Admin</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
