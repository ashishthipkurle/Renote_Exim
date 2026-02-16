export default function ExporterShipmentsPage() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-gradient-to-br from-[#0a0c12] via-[#0d1017] to-[#0a0c12]">
      <header className="flex-shrink-0 p-6 lg:p-8 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Shipment Tracking</h1>
        <p className="text-sm text-slate-400">Exporter view — fulfillment and carrier updates.</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 text-slate-300 text-sm">
          Connected route placeholder for exporter shipments.
        </div>
      </div>
    </div>
  );
}
