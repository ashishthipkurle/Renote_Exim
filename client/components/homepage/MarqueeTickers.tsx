export function ForwardMarquee() {
  return (
    <div className="w-full bg-slate-50/80 dark:bg-background-dark/80 backdrop-blur-md border-y border-slate-200 dark:border-white/10 py-4 overflow-hidden relative z-20 shadow-2xl">
      <div className="flex gap-16 animate-marquee whitespace-nowrap text-sm font-mono text-slate-400">
        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
          <span className="text-primary animate-pulse">●</span> SHP-8922: CN &gt; US <span className="text-white font-bold">$1.2M</span>{" "}
          <span className="text-green-400 flex items-center gap-1 text-xs bg-green-400/10 px-1 rounded">▲ 2.4%</span>
        </span>
        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
          <span className="text-primary animate-pulse">●</span> LOG-4412: DE &gt; FR <span className="text-white font-bold">$540K</span>{" "}
          <span className="text-blue-400 flex items-center gap-1 text-xs bg-blue-400/10 px-1 rounded">Processing</span>
        </span>
        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
          <span className="text-primary animate-pulse">●</span> AIR-9910: JP &gt; UK <span className="text-white font-bold">$3.1M</span>{" "}
          <span className="text-green-400 flex items-center gap-1 text-xs bg-green-400/10 px-1 rounded">▲ 0.8%</span>
        </span>
        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
          <span className="text-primary animate-pulse">●</span> SEA-1102: BR &gt; US <span className="text-white font-bold">$890K</span>{" "}
          <span className="text-green-400 flex items-center gap-1 text-xs bg-green-400/10 px-1 rounded">▲ 1.2%</span>
        </span>
        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
          <span className="text-primary animate-pulse">●</span> TRK-3321: CA &gt; MX <span className="text-white font-bold">$210K</span>{" "}
          <span className="text-slate-400 flex items-center gap-1 text-xs bg-white/10 px-1 rounded">Delivered</span>
        </span>
        {/* Duplicates for seamless loop */}
        <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
          <span className="text-primary animate-pulse">●</span> SHP-8922: CN &gt; US <span className="text-white font-bold">$1.2M</span>{" "}
          <span className="text-green-400 flex items-center gap-1 text-xs bg-green-400/10 px-1 rounded">▲ 2.4%</span>
        </span>
        <span className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">
          <span className="text-primary animate-pulse">●</span> LOG-4412: DE &gt; FR <span className="text-slate-900 dark:text-white font-bold">$540K</span>{" "}
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-400/10 px-1 rounded">Processing</span>
        </span>
      </div>
    </div>
  );
}

export function ReverseMarquee() {
  return (
    <div className="w-full bg-white dark:bg-[#0B0E14] border-y border-slate-200 dark:border-white/10 py-6 overflow-hidden relative z-20">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="flex gap-20 animate-marquee-reverse whitespace-nowrap text-sm font-mono text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">public</span>
          850 tonnes of Textiles: Vietnam &gt; USA
          <span className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">+1.2% Vol</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">local_shipping</span>
          Freight Index: Global
          <span className="text-slate-900 dark:text-white font-bold">2,410 pts</span>
          <span className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">+2.4%</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">oil_barrel</span>
          Crude Oil: Brent
          <span className="text-slate-900 dark:text-white font-bold">$82.40/bbl</span>
          <span className="text-red-700 dark:text-red-400 font-bold bg-red-100 dark:bg-red-900/20 px-2 py-0.5 rounded text-xs">-0.4%</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">memory</span>
          Semiconductors: Taiwan &gt; EU
          <span className="text-slate-900 dark:text-white font-bold">$45M Value</span>
          <span className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">High Demand</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">directions_boat</span>
          Container Spot Rate: Shanghai &gt; LA
          <span className="text-slate-900 dark:text-white font-bold">$1,850/FEU</span>
          <span className="text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-xs">Stable</span>
        </span>
        {/* Duplicates for seamless loop */}
        <span className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">public</span>
          850 tonnes of Textiles: Vietnam &gt; USA
          <span className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">+1.2% Vol</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm animate-pulse">local_shipping</span>
          Freight Index: Global
          <span className="text-slate-900 dark:text-white font-bold">2,410 pts</span>
          <span className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs">+2.4%</span>
        </span>
      </div>
    </div>
  );
}
