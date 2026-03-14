import AdminSidebar from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/lib/contexts/SidebarContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="bg-[#0b1019] text-slate-100 min-h-dvh overflow-hidden flex">
        <AdminSidebar />
        <div className="flex-1 min-w-0 h-dvh overflow-hidden">{children}</div>
      </div>
    </SidebarProvider>
  );
}
