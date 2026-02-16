import Link from "next/link";

export default function ExporterOrdersPage() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Orders</h1>
        <p className="text-sm text-slate-400">Exporter view — fulfill and track shipments.</p>
      </header>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
          <p className="text-slate-300 text-sm">Use the shared Orders page for the current flow.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/orders" className="text-primary font-bold hover:underline">
              Open /orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
