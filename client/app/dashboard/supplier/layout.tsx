import SupplierSidebar from "@/components/supplier/SupplierSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageTransition from "@/components/ui/PageTransition";

import { DashboardScaler } from "@/components/dashboard/DashboardScaler";
import DashboardCallWrapper from "@/components/session/DashboardCallWrapper";

import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/auth-server";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerAuthContext();

  // Guard: Must be logged in AND have SUPPLIER or ADMIN role
  if (!auth) {
    redirect("/login");
  }

  if (auth.role !== "SUPPLIER" && auth.role !== "ADMIN") {
    console.warn(`[Auth Guard] Wrong role for supplier dashboard: ${auth.role}. Redirecting...`);
    redirect("/dashboard");
  }

  return (
    <DashboardCallWrapper>
      <SidebarProvider>
        <DashboardScaler targetWidth={1440}>
          <div className="flex flex-col h-full w-full bg-board transition-colors duration-300 overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl">
            <DashboardHeader />

            <div className="flex flex-1 overflow-hidden relative border-t border-slate-200 dark:border-white/5">
              <SupplierSidebar basePath="/dashboard/supplier" />
              <SidebarInset>
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <div className="px-8 py-6">
                    <Breadcrumbs />
                  </div>
                  <PageTransition>{children}</PageTransition>
                </div>
              </SidebarInset>
            </div>
          </div>
        </DashboardScaler>
      </SidebarProvider>
    </DashboardCallWrapper>
  );
}
