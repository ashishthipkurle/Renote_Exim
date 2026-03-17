"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Package,
  Truck,
  LineChart,
  Wallet,
  Settings,
  User,
  FileText,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

function Item({ href, label, icon: Icon, basePath }: NavItem & { basePath: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== basePath && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={
        "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group " +
        (active
          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(19,91,236,0.15)]"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5")
      }
    >
      <Icon className="w-5 h-5 group-hover:text-primary transition-colors" />
      <span className="hidden lg:block text-sm font-semibold">{label}</span>
    </Link>
  );
}

export default function ClientSidebar({ basePath }: { basePath: string }) {
  const { user } = useAuth();
  const nav: NavItem[] = [
    { href: basePath, label: "Dashboard", icon: Home },
    { href: `${basePath}/orders`, label: "Orders", icon: Truck },
    { href: `${basePath}/rfqs`, label: "RFQs", icon: FileText },
    { href: `${basePath}/shipments`, label: "Shipments", icon: Package },
    { href: `${basePath}/inventory`, label: "Inventory", icon: LayoutGrid },
    { href: `${basePath}/analytics`, label: "Analytics", icon: LineChart },
    { href: `${basePath}/finance`, label: "Finance", icon: Wallet },
  ];

  return (
    <aside className="w-20 lg:w-64 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b1019] flex flex-col items-center lg:items-start py-6 transition-all duration-300 relative z-20">
      <nav className="flex-1 w-full px-3 space-y-2">
        {nav.map((n) => (
          <Item key={n.href} href={n.href} label={n.label} icon={n.icon} basePath={basePath} />
        ))}
      </nav>

      <div className="px-3 w-full mt-auto pt-6 border-t border-slate-200 dark:border-white/5 space-y-2">
        <Link
          href={`${basePath}/settings`}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Settings className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className="hidden lg:block text-sm font-medium">Settings</span>
        </Link>

        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-[#151c2a]/60 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors cursor-pointer">
          <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-slate-100 dark:ring-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
            {user?.avatar ? (
              <Image
                className="w-full h-full object-cover"
                alt="User"
                width={32} height={32}
                src={user.avatar as string}
                unoptimized
              />
            ) : (
              <User className="size-5" />
            )}
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{user?.name ?? "User"}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize">
              {user?.role?.toLowerCase() ?? "Account"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
