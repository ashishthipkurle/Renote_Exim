import ExporterSidebar from "@/components/exporter/ExporterSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/lib/contexts/SidebarContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageTransition from "@/components/ui/PageTransition";

export default function ExporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="bg-background text-foreground h-dvh flex flex-col overflow-hidden transition-colors duration-300">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden">
          <ExporterSidebar />
          <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 lg:p-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
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
