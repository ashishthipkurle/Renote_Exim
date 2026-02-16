import ClientSidebar from "@/components/client/ClientSidebar";

export default function ExporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0a0c12] text-slate-100 min-h-dvh overflow-hidden flex">
      <ClientSidebar basePath="/dashboard/exporter" />
      <div className="flex-1 min-w-0 h-dvh overflow-hidden">{children}</div>
    </div>
  );
}
