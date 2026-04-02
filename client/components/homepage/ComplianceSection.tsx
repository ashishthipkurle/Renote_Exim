"use client";

export default function ComplianceSection() {
  return (
    <section className="py-24 bg-[url('/assets/pexels-yankrukov-8867376.jpg')] bg-cover bg-top bg-fixed border-t border-border relative z-20">
      <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]"></div>
      <div className="max-w-6xl mx-auto px-6 relative z-10 reveal-on-scroll">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2 block drop-shadow-sm">Bureaucracy Simplified</span>
          <h2 className="text-4xl font-bold text-foreground mb-6 drop-shadow-sm">SMART TRADE <br /><span className="text-primary">COMPLIANCE</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium drop-shadow-sm">Navigate complex international regulations with our AI-driven legal engine. We handle the paperwork so you can focus on the deal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card bg-background/70 backdrop-blur-md p-8 rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors shadow-inner">
              <span className="material-symbols-outlined text-primary text-2xl">description</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Automated Customs</h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Instantly generate HS codes, commercial invoices, and packing lists compliant with destination country laws.
            </p>
            <div className="mt-6 pt-6 border-t border-slate-300/50 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-green-700 dark:text-green-400 font-bold">99.8% Accuracy</span>
              <span className="material-icons text-slate-500 dark:text-slate-400 text-sm group-hover:text-primary transition-colors">arrow_forward</span>
            </div>
          </div>

          <div className="glass-card bg-white/70 dark:bg-[#0B0E14]/60 backdrop-blur-md p-8 rounded-xl border border-white/40 dark:border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group relative shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors shadow-inner">
                <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">VAT/Tax Intelligence</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Real-time calculation of landed costs including duties, taxes, and port fees for accurate profit forecasting.
              </p>
              <div className="mt-6 pt-6 border-t border-slate-300/50 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-blue-700 dark:text-blue-400 font-bold">Global Coverage</span>
                <span className="material-icons text-slate-500 dark:text-slate-400 text-sm group-hover:text-primary transition-colors">arrow_forward</span>
              </div>
            </div>
          </div>

          <div className="glass-card bg-white/70 dark:bg-[#0B0E14]/60 backdrop-blur-md p-8 rounded-xl border border-white/40 dark:border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group shadow-xl">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors shadow-inner">
              <span className="material-symbols-outlined text-primary text-2xl">token</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Blockchain Ledger</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Immutable record keeping for every transaction and document version, ensuring audit-proof trade history.
            </p>
            <div className="mt-6 pt-6 border-t border-slate-300/50 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-purple-700 dark:text-purple-400 font-bold">Crypto-Secured</span>
              <span className="material-icons text-slate-500 dark:text-slate-400 text-sm group-hover:text-primary transition-colors">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
