export const dynamic = 'force-dynamic';

import ExporterSidebar from "@/components/exporter/ExporterSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageTransition from "@/components/ui/PageTransition";

import { DashboardScaler } from "@/components/dashboard/DashboardScaler";

export default function ExporterLayout({ children }: { children: React.ReactNode }) {
 return (
 <SidebarProvider>
 <DashboardScaler targetWidth={1440}>
 <div className="flex flex-col h-full w-full bg-board transition-colors duration-300 overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl">
 <DashboardHeader />

 <div className="flex flex-1 overflow-hidden relative border-t border-slate-200 dark:border-white/5">
 <ExporterSidebar basePath="/dashboard/exporter" />
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
