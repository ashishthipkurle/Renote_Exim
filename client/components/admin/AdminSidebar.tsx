"use client";

import type { ComponentType } from "react";
import Link from "next/link";
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
 Users,
 Rss,
 TrendingUp,
 LayoutGrid,
} from "lucide-react";
import {
 Sidebar,
 SidebarContent,
 SidebarFooter,
 SidebarHeader,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 SidebarSeparator,
 useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";

type NavItem = {
 href: string;
 labelKey: string;
 defaultLabel: string;
 icon: ComponentType<{ className?: string }>;
};

export default function AdminSidebar({ basePath = "/dashboard/admin" }: { basePath?: string }) {
 const { t } = useTranslation();
 const pathname = usePathname();
 const { setOpenMobile } = useSidebar();

 const nav: NavItem[] = [
 { href: basePath, labelKey: "sidebar.overview", defaultLabel: "Overview", icon: LayoutDashboard },
 { href: `${basePath}/users`, labelKey: "sidebar.users", defaultLabel: "Users", icon: Users },
 { href: `${basePath}/products`, labelKey: "sidebar.products", defaultLabel: "Products", icon: Package },
 { href: `${basePath}/orders`, labelKey: "sidebar.orders", defaultLabel: "Orders", icon: Boxes },
 { href: `${basePath}/shipments`, labelKey: "sidebar.shipments", defaultLabel: "Shipments", icon: FolderTree },
 { href: `${basePath}/analytics`, labelKey: "sidebar.analytics", defaultLabel: "Analytics", icon: LineChart },
 { href: `${basePath}/categories`, labelKey: "sidebar.categories", defaultLabel: "Categories", icon: LayoutGrid },
 { href: `${basePath}/feed`, labelKey: "sidebar.feed", defaultLabel: "Activity Feed", icon: Rss },
 { href: `${basePath}/trends`, labelKey: "sidebar.trends", defaultLabel: "Market Trends", icon: TrendingUp },
 { href: `${basePath}/notifications`, labelKey: "notifications", defaultLabel: "Notifications", icon: Bell },
 { href: `${basePath}/directory`, labelKey: "sidebar.directory", defaultLabel: "Directory", icon: Globe },
 ];

 const isActive = (href: string) => 
 pathname === href || (href !== basePath && pathname.startsWith(href + "/"));

 return (
 <Sidebar variant="inset" className="border-r-0">
 <SidebarContent className="px-3 pt-4">
 <SidebarMenu>
 {nav.map((item) => (
 <SidebarMenuItem key={item.href}>
 <SidebarMenuButton
 asChild
 isActive={isActive(item.href)}
 tooltip={t(item.labelKey, item.defaultLabel)}
 className={cn(
 "rounded-xl transition-all duration-300",
 isActive(item.href) 
 ? "bg-primary/10 text-primary hover:bg-primary/15" 
 : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5"
 )}
 >
 <Link href={item.href} className="flex items-center gap-3 w-full" onClick={() => setOpenMobile(false)}>
 <item.icon className={cn("size-5 transition-colors", isActive(item.href) ? "text-primary" : "group-hover:text-primary")} />
 <span className="font-semibold text-sm">{t(item.labelKey, item.defaultLabel)}</span>
 </Link>
 </SidebarMenuButton>
 </SidebarMenuItem>
 ))}
 </SidebarMenu>
 </SidebarContent>

 <SidebarFooter className="p-6 space-y-4">
 <SidebarSeparator />
 <SidebarMenu>
 <SidebarMenuItem>
 <SidebarMenuButton
 asChild
 isActive={isActive(`${basePath}/settings`)}
 tooltip={t("sidebar.settings", "Global Settings")}
 className={cn(
 "rounded-xl transition-all duration-300",
 isActive(`${basePath}/settings`) 
 ? "bg-primary/10 text-primary hover:bg-primary/15" 
 : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5"
 )}
 >
 <Link href={`${basePath}/settings`} className="flex items-center gap-3 w-full" onClick={() => setOpenMobile(false)}>
 <Settings className={cn("size-5 transition-colors", isActive(`${basePath}/settings`) ? "text-primary" : "group-hover:text-primary")} />
 <span className="font-semibold text-sm">{t("sidebar.settings", "Settings")}</span>
 </Link>
 </SidebarMenuButton>
 </SidebarMenuItem>
 </SidebarMenu>
 </SidebarFooter>
 </Sidebar>
 );
}
