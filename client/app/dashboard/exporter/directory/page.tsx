import Link from "next/link";
import { Star } from "lucide-react";

const partners = [
  {
    name: "TechSolutions Ltd",
    region: "Shenzhen, CN",
    category: "Electronics",
    orders: "1,204",
    rating: "4.9",
    initials: "TS",
    bgColor: "bg-blue-500/20",
    txtColor: "text-blue-400",
    status: "Verified",
    statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    name: "Global Exports Inc",
    region: "Hamburg, DE",
    category: "Industrial Machinery",
    orders: "892",
    rating: "4.8",
    initials: "GE",
    bgColor: "bg-purple-500/20",
    txtColor: "text-purple-400",
    status: "Verified",
    statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    name: "Vietnam Industrial",
    region: "Hanoi, VN",
    category: "Raw Materials",
    orders: "654",
    rating: "4.7",
    initials: "VI",
    bgColor: "bg-green-500/20",
    txtColor: "text-green-400",
    status: "Verified",
    statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    name: "Pacific Trade Co",
    region: "Tokyo, JP",
    category: "Electronics",
    orders: "532",
    rating: "4.6",
    initials: "PT",
    bgColor: "bg-cyan-500/20",
    txtColor: "text-cyan-400",
    status: "Pending",
    statusColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  },
  {
    name: "Mumbai Textiles",
    region: "Mumbai, IN",
    category: "Textiles",
    orders: "421",
    rating: "4.5",
    initials: "MT",
    bgColor: "bg-orange-500/20",
    txtColor: "text-orange-400",
    status: "Verified",
    statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    name: "Brazil Agro Exports",
    region: "São Paulo, BR",
    category: "Agriculture",
    orders: "398",
    rating: "4.4",
    initials: "BA",
    bgColor: "bg-emerald-500/20",
    txtColor: "text-emerald-400",
    status: "Verified",
    statusColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
];

export default function DirectoryPage() {
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0c12] to-[#0a0c12]">
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0a0c12]/30 backdrop-blur-sm z-40">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Worldwide Partner Directory</h1>
          <p className="text-slate-400 text-sm">Browse and manage your global supplier network</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              className="pl-10 pr-4 py-2 bg-[#151c2a]/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary w-64 transition-all"
              placeholder="Search partners..."
              type="text"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary hover:bg-[#0f49bd] text-white text-sm font-bold shadow-lg shadow-primary/20 transition-colors">
            + Add Partner
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {partners.map((p) => (
            <div
              key={p.name}
              className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${p.bgColor} ${p.txtColor} flex items-center justify-center font-bold text-sm`}>
                    {p.initials}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{p.name}</h3>
                    <p className="text-slate-400 text-xs">{p.region}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${p.statusColor}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-slate-400">{p.category}</span>
                <span className="text-yellow-500 font-bold flex items-center gap-1">
                  {p.rating} <Star className="w-3.5 h-3.5 fill-yellow-500" />
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs text-slate-400">{p.orders} orders</span>
                <Link href="#" className="text-primary text-xs font-bold hover:underline">
                  View Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
