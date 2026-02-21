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
  Radio,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const nav = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/admin/feed", label: "Marketplace Feed", icon: Radio },
  { href: "/dashboard/admin/categories", label: "All Categories", icon: FolderTree },
  { href: "/dashboard/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/dashboard/admin/directory", label: "Directory", icon: Globe },
  { href: "/dashboard/admin/trends", label: "Trends", icon: LineChart },
  { href: "/dashboard/admin/notifications", label: "Notifications", icon: Bell },
];

function Item({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={
        "group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all " +
        (active
          ? "bg-primary text-white shadow-[0_0_15px_rgba(19,91,236,0.5)]"
          : "text-slate-400 hover:text-white hover:bg-white/5")
      }
    >
      <Icon className="w-6 h-6" />
      <div className="absolute left-14 bg-[#151c2a] border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
        {label}
      </div>
    </Link>
  );
}

export default function AdminSidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-24 h-dvh sticky top-0 bg-[#0b1019]/90 backdrop-blur-xl border-r border-white/5 z-50 flex-shrink-0 items-center py-6">
      <div className="mb-10 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
        <Package className="text-white w-6 h-6" />
      </div>

      <div className="flex-1 flex flex-col gap-6 w-full items-center">
        {nav.map((n) => (
          <Item key={n.href} href={n.href} label={n.label} icon={n.icon} />
        ))}
      </div>

      <div className="flex flex-col gap-4 items-center w-full">
        <Link
          href="/dashboard/settings"
          className="group relative w-12 h-12 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-6 h-6" />
          <div className="absolute left-14 bg-[#151c2a] border border-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
            Settings
          </div>
        </Link>

        <div className="w-10 h-10 rounded-full border-2 border-slate-700 overflow-hidden cursor-pointer hover:border-primary transition-colors flex items-center justify-center bg-slate-800 text-slate-400">
          {user?.avatar ? (
            <Image
              alt="User"
              width={40} height={40}
              className="w-full h-full object-cover"
              src={user.avatar as string}
              unoptimized
            />
          ) : (
            <User className="size-6" />
          )}
        </div>
      </div>
    </aside>
  );
}
