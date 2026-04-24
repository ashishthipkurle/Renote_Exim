"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
 Home,
 Boxes,
 Truck,
 LineChart,
 Wallet,
 Settings,
 FileText,
  Users,
  ShoppingBag
} from "lucide-react";
import {
 Sidebar,
 SidebarContent,
 SidebarFooter,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";


interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export default function ImporterSidebar({ basePath, children }: { basePath: string; children?: React.ReactNode }) {
 const pathname = usePathname();

 const nav: NavItem[] = [
    { href: basePath, label: "Dashboard", icon: Home },
    { href: `${basePath}/directory`, label: "Sellers", icon: Users },
    { href: `${basePath}/orders`, label: "Orders", icon: Truck },
    { href: `${basePath}/inventory`, label: "Inventory", icon: Boxes },
    { href: `${basePath}/analytics`, label: "Analytics", icon: LineChart },
    { href: `${basePath}/finance`, label: "Finance", icon: Wallet },
  ];

 const isActive = (href: string) =>
 pathname === href || (href !== basePath && pathname.startsWith(href + "/"));

 const isMarketplace = pathname === "/products" || pathname.startsWith("/products/");

 return (
 <Sidebar variant="inset" className="border-r-0">
 <SidebarContent className="px-3 pt-4">
 {!isMarketplace && (
 <SidebarMenu>
 {nav.map((item) => (
 <SidebarMenuItem key={item.href}>
 <SidebarMenuButton
 asChild
 isActive={isActive(item.href)}
 tooltip={item.label}
 className={cn(
 "rounded-xl transition-all duration-300",
 isActive(item.href)
 ? "bg-black/10 dark:bg-white/10 text-[#D4AF37] dark:text-[#D4AF37] hover:bg-black/15 dark:hover:bg-white/15"
 : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#D4AF37] dark:hover:text-[#D4AF37]"
 )}
 >
 <Link href={item.href} className="flex items-center gap-3 w-full">
 <item.icon className="size-5 transition-colors" />
 <span className="font-semibold text-sm">{item.label}</span>
 </Link>
 </SidebarMenuButton>
 </SidebarMenuItem>
 ))}
 </SidebarMenu>
 )}
      {children && (
        <div className="mt-8 mb-4 px-2">
          {children}
        </div>
      )}
    </SidebarContent>

 {!isMarketplace && (
 <SidebarFooter className="px-6 pt-4 pb-2 space-y-4">
 <SidebarSeparator />
 <SidebarMenu>
 <SidebarMenuItem>
 <SidebarMenuButton
 asChild
 isActive={isActive(`${basePath}/settings`)}
 tooltip="Settings"
 className={cn(
 "rounded-xl transition-all duration-300",
 isActive(`${basePath}/settings`)
 ? "bg-black/10 dark:bg-white/10 text-[#D4AF37] dark:text-[#D4AF37] hover:bg-black/15 dark:hover:bg-white/15"
 : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#D4AF37] dark:hover:text-[#D4AF37]"
 )}
 >
 <Link href={`${basePath}/settings`} className="flex items-center gap-3 w-full">
 <Settings className="size-5 transition-colors" />
 <span className="font-semibold text-sm">Settings</span>
 </Link>
 </SidebarMenuButton>
 </SidebarMenuItem>
 </SidebarMenu>
 </SidebarFooter>
 )}
 </Sidebar>
 );
}
