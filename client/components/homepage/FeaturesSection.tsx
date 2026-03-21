import Image from "next/image";

export default function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-muted dark:bg-background">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 reveal-trigger">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              ENGINEERED FOR <br />
              <span className="text-primary">MODERN LOGISTICS</span>
            </h2>
            <p className="text-muted-foreground text-lg">Our platform combines institutional-grade financial tools with real-time supply chain visibility.</p>
          </div>
          <button className="text-primary hover:text-slate-900 dark:hover:text-white font-semibold flex items-center gap-2 transition-colors group" type="button">
            Explore Capabilities <span className="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 dark:bg-transparent rounded-2xl p-8 relative group overflow-hidden h-[450px] flex flex-col justify-end hover:shadow-2xl dark:hover:shadow-[0_0_40px_rgba(19,91,236,0.15)] reveal-trigger" style={{ transitionDelay: "0ms" }}>
            <div className="absolute inset-0 z-0">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdACOt5E6X3UdwnFb8tiSClZI5sFRnyDfjOc9oLAun06nw-9LllRIlSrJvBskhY4ylHulzIxDGMJ_fb9U6momci6kMKvXDjBQURIQGu_jC-oeuyeLB7SajYmhGTeeDNMoUunSpwXInqwJUPqafyddm8cqfsEHI-t8UFj8EKTZ-xoISuMGiXdXGZwwhOsAFU-iB0ioFhqSmmOLv-TFjUTyJDCk4xxHvaxCDs7aTW3Ob-fQrOEmB5YO1J8MYBVO4PvAWSIdvIer2wUs"
                alt="Shipping containers stacked in a modern port"
                width={800} height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6">
                <svg className="w-full h-full text-primary" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path className="blueprint-path" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Real-time Tracking</h3>
              <p className="text-slate-200 text-sm leading-relaxed mb-6 drop-shadow-md group-hover:text-white transition-colors">Precision monitoring of your cargo via satellite and IoT sensors across air, sea, and land routes.</p>
              <div className="h-[1px] w-full bg-gradient-to-r from-primary/50 to-transparent mb-4 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 dark:bg-transparent rounded-2xl p-8 relative group overflow-hidden h-[450px] flex flex-col justify-end hover:shadow-2xl dark:hover:shadow-[0_0_40px_rgba(19,91,236,0.15)] reveal-trigger" style={{ transitionDelay: "150ms" }}>
            <div className="absolute inset-0 z-0">
              <Image
                src="/home/financial-graphs.png"
                alt="Financial data graphs"
                width={800} height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6">
                <svg className="w-full h-full text-primary" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path className="blueprint-path" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Secure Escrow</h3>
              <p className="text-slate-200 text-sm leading-relaxed mb-6 drop-shadow-md group-hover:text-white transition-colors">Smart contracts hold funds securely until delivery conditions are met and verified by digital BOLs.</p>
              <div className="h-[1px] w-full bg-gradient-to-r from-primary/50 to-transparent mb-4 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 dark:bg-transparent rounded-2xl p-8 relative group overflow-hidden h-[450px] flex flex-col justify-end hover:shadow-2xl dark:hover:shadow-[0_0_40px_rgba(19,91,236,0.15)] reveal-trigger" style={{ transitionDelay: "300ms" }}>
            <div className="absolute inset-0 z-0">
              <Image
                src="/assets/compliance-abstract.jpg"
                alt="Abstract compliance"
                width={800} height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6">
                <svg className="w-full h-full text-primary" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <rect className="blueprint-path" x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line className="blueprint-path" x1="16" y1="2" x2="16" y2="6" />
                  <line className="blueprint-path" x1="8" y1="2" x2="8" y2="6" />
                  <line className="blueprint-path" x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Global Compliance</h3>
              <p className="text-slate-200 text-sm leading-relaxed mb-6 drop-shadow-md group-hover:text-white transition-colors">Automated customs documentation and regulatory checks for over 190 jurisdictions.</p>
              <div className="h-[1px] w-full bg-gradient-to-r from-primary/50 to-transparent mb-4 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
