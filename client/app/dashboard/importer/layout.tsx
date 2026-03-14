import ClientSidebar from "@/components/client/ClientSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/lib/contexts/SidebarContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageTransition from "@/components/ui/PageTransition";

export default function ImporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="bg-[#0a0c12] text-slate-100 h-dvh flex flex-col overflow-hidden">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden">
          <ClientSidebar basePath="/dashboard/importer" />
          <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 lg:p-8 scrollbar-thin scrollbar-thumb-slate-800">
            <Breadcrumbs />
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
