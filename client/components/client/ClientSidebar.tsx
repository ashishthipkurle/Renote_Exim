"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Truck,
  LineChart,
  Wallet,
  Settings,
  FileText,
  LogOut,
  User,
  Users,
  MessageSquare,
  PhoneCall,
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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export default function ClientSidebar({ basePath }: { basePath: string }) {
  const pathname = usePathname();

  const nav: NavItem[] = [
    { href: basePath, label: "Dashboard", icon: Home },
    { href: `${basePath}/directory`, label: "Directory", icon: Users },
    { href: `${basePath}/orders`, label: "Orders", icon: Truck },
    { href: `${basePath}/rfqs`, label: "RFQs", icon: FileText },
    { href: `${basePath}/messages`, label: "Messages", icon: MessageSquare },
    { href: `${basePath}/calls`, label: "Calls", icon: PhoneCall },
    { href: `${basePath}/inventory`, label: "Inventory", icon: LayoutGrid },
    { href: `${basePath}/analytics`, label: "Analytics", icon: LineChart },
    { href: `${basePath}/finance`, label: "Finance", icon: Wallet },
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
                tooltip={item.label}
                className={cn(
                  "rounded-xl transition-all duration-300",
                  isActive(item.href) 
                    ? "bg-primary/10 text-primary hover:bg-primary/15" 
                    : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <Link href={item.href} className="flex items-center gap-3 w-full">
                  <item.icon className={cn("size-5 transition-colors", isActive(item.href) ? "text-primary" : "group-hover:text-primary")} />
                  <span className="font-semibold text-sm">{item.label}</span>
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
              tooltip="Settings"
              className={cn(
                "rounded-xl transition-all duration-300",
                isActive(`${basePath}/settings`) 
                  ? "bg-primary/10 text-primary hover:bg-primary/15" 
                  : "text-slate-500 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <Link href={`${basePath}/settings`} className="flex items-center gap-3 w-full">
                <Settings className={cn("size-5 transition-colors", isActive(`${basePath}/settings`) ? "text-primary" : "group-hover:text-primary")} />
                <span className="font-semibold text-sm">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
