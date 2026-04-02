import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageTransition from "@/components/ui/PageTransition";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-svh w-full bg-board transition-colors duration-300 overflow-hidden">
        <DashboardHeader />
        
        <div className="flex flex-1 overflow-hidden relative">
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
    </SidebarProvider>
  );
}
