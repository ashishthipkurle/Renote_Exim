import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageTransition from "@/components/ui/PageTransition";

import { DashboardScaler } from "@/components/dashboard/DashboardScaler";

import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerAuthContext();

  // Guard: Must be logged in AND have ADMIN role
  if (!auth) {
    redirect("/login");
  }

  if (auth.role !== "ADMIN") {
    console.warn(`[Auth Guard] Unauthorized access attempt to admin dashboard: ${auth.role}`);
    redirect("/dashboard");
  }

  return (
    <SidebarProvider>
 <DashboardScaler targetWidth={1440}>
 <div className="flex flex-col h-full w-full bg-board transition-colors duration-300 overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl">
 <DashboardHeader />

 <div className="flex flex-1 overflow-hidden relative border-t border-slate-200 dark:border-white/5">
 <AdminSidebar basePath="/dashboard/admin" />
 <SidebarInset>
 <div className="flex-1 overflow-auto custom-scrollbar">
 <div className="px-8 py-6">
 <Breadcrumbs />
 </div>
 <PageTransition>
 {children}
 </PageTransition>
 </div>
 </SidebarInset>
 </div>
 </div>
 </DashboardScaler>
 </SidebarProvider>
 );
}
