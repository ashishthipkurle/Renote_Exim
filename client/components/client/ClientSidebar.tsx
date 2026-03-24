"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Package,
  Truck,
  LineChart,
  Wallet,
  Settings,
  FileText,
} from "lucide-react";
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
          : "text-slate-400 hover:text-white hover:bg-white/5")
      }
    >
      <Icon className="w-5 h-5 group-hover:text-primary transition-colors" />
      <span className="hidden lg:block text-sm font-semibold">{label}</span>
    </Link>
  );
}

export default function ClientSidebar({ basePath }: { basePath: string }) {
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
    <aside className="w-20 lg:w-64 border-r border-white/5 bg-[#0b1019] flex flex-col items-center lg:items-start py-6 transition-all duration-300 relative z-20">
      <nav className="flex-1 w-full px-3 space-y-2">
        {nav.map((n) => (
          <Item key={n.href} href={n.href} label={n.label} icon={n.icon} basePath={basePath} />
        ))}
      </nav>

      <div className="px-3 w-full mt-auto pt-6 border-t border-white/5 space-y-2">
        <Link
          href={`${basePath}/settings`}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group text-slate-400 hover:text-white"
        >
          <Settings className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className="hidden lg:block text-sm font-medium">Settings</span>
        </Link>

        {/* Profile removed */}
      </div>
    </aside>
  );
}
