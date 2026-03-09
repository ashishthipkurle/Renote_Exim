import ClientSidebar from "@/components/client/ClientSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/lib/contexts/SidebarContext";

export default function ImporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="bg-[#0a0c12] text-slate-100 h-dvh flex flex-col overflow-hidden">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden">
          <ClientSidebar basePath="/dashboard/importer" />
          <main className="flex-1 min-w-0 h-full overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
