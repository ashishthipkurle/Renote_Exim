"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function HomePage() {
  const pokerDeckRef = useRef<HTMLDivElement | null>(null);
  const pokerReadyTimeoutRef = useRef<number | null>(null);

  const setPokerReadyAfterAnimation = () => {
    if (pokerReadyTimeoutRef.current) window.clearTimeout(pokerReadyTimeoutRef.current);
    pokerDeckRef.current?.classList.remove("poker-ready");
    pokerReadyTimeoutRef.current = window.setTimeout(() => {
      pokerDeckRef.current?.classList.add("poker-ready");
    }, 1600);
  };

  const clearPokerReady = () => {
    if (pokerReadyTimeoutRef.current) window.clearTimeout(pokerReadyTimeoutRef.current);
    pokerReadyTimeoutRef.current = null;
    pokerDeckRef.current?.classList.remove("poker-ready");
  };

  useEffect(() => {
    const triggerObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("opacity-0", "translate-y-[60px]");
          entry.target.classList.add("opacity-100", "translate-y-0");
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );

    document.querySelectorAll<HTMLElement>(".reveal-trigger").forEach((el) => {
      el.classList.add(
        "opacity-0",
        "translate-y-[60px]",
        "transition-all",
        "duration-1000",
        "ease-out"
      );
      triggerObserver.observe(el);
    });

    const scrollObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("active");
          obs.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );

    document.querySelectorAll<HTMLElement>(".reveal-on-scroll").forEach((el) => {
      scrollObserver.observe(el);
    });

    const heroGlobe = document.getElementById("hero-globe") as HTMLDivElement | null;
    const onScroll = () => {
      if (!heroGlobe) return;
      const scrolled = window.scrollY;

      const viewportHeight = window.innerHeight;
      const moveSpeed = 0.04;
      const initialY = 30;
      const newY = initialY + scrolled * moveSpeed;

      const rotation = scrolled * 0.02;
      const scale = 1.0 + scrolled * 0.0003;

      heroGlobe.style.backgroundPosition = `center ${newY}%`;
      heroGlobe.style.transform = `scale(${scale}) rotate(${rotation}deg)`;

      if (scrolled > viewportHeight) {
        heroGlobe.style.opacity = "0.4";
      } else {
        const opacity = Math.min(1, Math.max(0.4, 0.4 + scrolled * 0.0001));
        heroGlobe.style.opacity = String(opacity);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      triggerObserver.disconnect();
      scrollObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (pokerReadyTimeoutRef.current) window.clearTimeout(pokerReadyTimeoutRef.current);
    };
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display selection:bg-primary selection:text-white overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold primary-glow-hover">
              <span className="material-icons text-sm">public</span>
            </div>
            <span className="text-xl font-bold tracking-wide text-white">
              RENOTE<span className="text-primary">EXIM</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link className="hover:text-white transition-colors" href="/products">
              Marketplace
            </Link>
            <Link className="hover:text-white transition-colors" href="/dashboard/admin/shipments">
              Logistics
            </Link>
            <Link className="hover:text-white transition-colors" href="/dashboard/admin/analytics">
              Data
            </Link>
            <Link className="hover:text-white transition-colors" href="/contact">
              Enterprise
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link className="hidden md:block text-sm font-medium text-white hover:text-primary transition-colors" href="/login">
              Login
            </Link>
            <Link className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2 px-6 rounded-lg primary-glow transition-all duration-300 transform hover:scale-105 primary-glow-hover" href="/register">
              Get Started
            </Link>
            <button className="md:hidden text-white" type="button" aria-label="Menu">
              <span className="material-icons">menu</span>
            </button>
          </div>
        </div>
      </nav>

      <header className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-background-dark bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-screen transition-transform duration-100 ease-linear"
            id="hero-globe"
            style={{ backgroundPosition: "center 30%", transform: "scale(1.1)" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/90 via-transparent to-background-dark" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 via-transparent to-background-dark/80" aria-hidden="true" />
          <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] animate-pulse" aria-hidden="true" />
          <div className="absolute bottom-1/3 right-1/4 w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[140px]" aria-hidden="true" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center justify-center h-full mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 mb-10 animate-[float_4s_ease-in-out_infinite]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Global Network Active</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 tracking-tight leading-none drop-shadow-2xl">
            TRADE WITHOUT <br />
            <span className="gradient-text text-glow relative inline-block">
              BORDERS
              <svg
                className="absolute -bottom-2 w-full h-3 text-primary opacity-60"
                fill="none"
                viewBox="0 0 200 9"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.00025 6.99999C44.7571 2.29657 122.373 -3.10271 197.986 6.99999"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light drop-shadow-lg">
            The next-generation B2B marketplace. Connect with verified suppliers, automate logistics, and track shipments in real-time across our immersive global network.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg mx-auto">
            <Link
              className="w-full sm:w-1/2 bg-primary hover:bg-primary/90 text-white font-bold py-5 px-8 rounded-xl primary-glow transition-all duration-300 text-lg flex items-center justify-center gap-2 group flowing-border primary-glow-hover shadow-[0_0_40px_-10px_rgba(19,91,236,0.6)] hover:shadow-[0_0_60px_-10px_rgba(19,91,236,0.8)] hover:-translate-y-1"
              href="/products"
            >
              Start Trading
              <span className="material-icons group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
            </Link>
            <button
              className="w-full sm:w-1/2 glass-panel hover:bg-white/10 text-white font-semibold py-5 px-8 rounded-xl transition-all duration-300 text-lg flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 hover:-translate-y-1 backdrop-blur-xl"
              type="button"
            >
              <span className="material-icons text-primary text-xl">play_circle</span>
              Watch Demo
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
          <span className="text-xs uppercase tracking-widest font-semibold">Scroll to Explore</span>
          <span className="material-icons text-2xl">keyboard_arrow_down</span>
        </div>
      </header>

      <div className="w-full bg-background-dark/80 backdrop-blur-md border-y border-white/10 py-4 overflow-hidden relative z-20 shadow-2xl">
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
          <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
            <span className="text-primary animate-pulse">●</span> SHP-8922: CN &gt; US <span className="text-white font-bold">$1.2M</span>{" "}
            <span className="text-green-400 flex items-center gap-1 text-xs bg-green-400/10 px-1 rounded">▲ 2.4%</span>
          </span>
          <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
            <span className="text-primary animate-pulse">●</span> LOG-4412: DE &gt; FR <span className="text-white font-bold">$540K</span>{" "}
            <span className="text-blue-400 flex items-center gap-1 text-xs bg-blue-400/10 px-1 rounded">Processing</span>
          </span>
        </div>
      </div>

      <section className="py-16 bg-background-dark border-b border-white/5 relative reveal-on-scroll active">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center md:text-left border-r border-white/5 last:border-0 pr-4 group hover:bg-white/5 p-4 rounded transition-colors">
            <h3 className="text-4xl font-bold text-white mb-1 group-hover:text-primary transition-colors">2.4M+</h3>
            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Shipments Tracked</p>
          </div>
          <div className="text-center md:text-left border-r border-white/5 last:border-0 pr-4 group hover:bg-white/5 p-4 rounded transition-colors">
            <h3 className="text-4xl font-bold text-white mb-1 group-hover:text-primary transition-colors">$85B</h3>
            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Trade Volume</p>
          </div>
          <div className="text-center md:text-left border-r border-white/5 last:border-0 pr-4 group hover:bg-white/5 p-4 rounded transition-colors">
            <h3 className="text-4xl font-bold text-white mb-1 group-hover:text-primary transition-colors">190+</h3>
            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Countries Served</p>
          </div>
          <div className="text-center md:text-left pr-4 group hover:bg-white/5 p-4 rounded transition-colors">
            <h3 className="text-4xl font-bold text-white mb-1 group-hover:text-primary transition-colors">0.01s</h3>
            <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Data Latency</p>
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden bg-surface-dark">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 reveal-trigger">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold text-white mb-4">
                ENGINEERED FOR <br />
                <span className="text-primary">MODERN LOGISTICS</span>
              </h2>
              <p className="text-slate-400 text-lg">Our platform combines institutional-grade financial tools with real-time supply chain visibility.</p>
            </div>
            <button className="text-primary hover:text-white font-semibold flex items-center gap-2 transition-colors group" type="button">
              Explore Capabilities <span className="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-8 relative group overflow-hidden h-[450px] flex flex-col justify-end hover:shadow-[0_0_40px_rgba(19,91,236,0.15)] reveal-trigger" style={{ transitionDelay: "0ms" }}>
              <div className="absolute inset-0 z-0 opacity-50 group-hover:opacity-30 transition-opacity">
                <img
                  alt="Shipping containers stacked in a modern port"
                  className="w-full h-full object-cover grayscale mix-blend-overlay"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdACOt5E6X3UdwnFb8tiSClZI5sFRnyDfjOc9oLAun06nw-9LllRIlSrJvBskhY4ylHulzIxDGMJ_fb9U6momci6kMKvXDjBQURIQGu_jC-oeuyeLB7SajYmhGTeeDNMoUunSpwXInqwJUPqafyddm8cqfsEHI-t8UFj8EKTZ-xoISuMGiXdXGZwwhOsAFU-iB0ioFhqSmmOLv-TFjUTyJDCk4xxHvaxCDs7aTW3Ob-fQrOEmB5YO1J8MYBVO4PvAWSIdvIer2wUs"
                />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 mb-6">
                  <svg className="w-full h-full text-primary" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <path className="blueprint-path" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Real-time Tracking</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-200 transition-colors">Precision monitoring of your cargo via satellite and IoT sensors across air, sea, and land routes.</p>
                <div className="h-[1px] w-full bg-gradient-to-r from-primary/50 to-transparent mb-4 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 relative group overflow-hidden h-[450px] flex flex-col justify-end hover:shadow-[0_0_40px_rgba(19,91,236,0.15)] reveal-trigger" style={{ transitionDelay: "150ms" }}>
              <div className="absolute inset-0 z-0 opacity-50 group-hover:opacity-30 transition-opacity">
                <img
                  alt="Financial data graphs"
                  className="w-full h-full object-cover grayscale mix-blend-overlay"
                  src="/home/financial-graphs.png"
                />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 mb-6">
                  <svg className="w-full h-full text-primary" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <path className="blueprint-path" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Secure Escrow</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-200 transition-colors">Smart contracts hold funds securely until delivery conditions are met and verified by digital BOLs.</p>
                <div className="h-[1px] w-full bg-gradient-to-r from-primary/50 to-transparent mb-4 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 relative group overflow-hidden h-[450px] flex flex-col justify-end hover:shadow-[0_0_40px_rgba(19,91,236,0.15)] reveal-trigger" style={{ transitionDelay: "300ms" }}>
              <div className="absolute inset-0 z-0 opacity-50 group-hover:opacity-30 transition-opacity">
                <img
                  alt="Abstract compliance"
                  className="w-full h-full object-cover grayscale mix-blend-overlay"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKDuMTrjpqWo8FRBuZ06sZv7g4mVUM074B_OW3YN8eybb1EJy9zSfE1IT20me_gEqThJjuMlIOtP0LA1Kz-JMWj5bmuDA3n7T0ne1eNTfFMcRSop_ggfcAzVxe-3bojKG0t_BtGmwap0WWc1HuDGxWO6IRA5VQgVTsNdYDbcZj7mgzcCCl90L_4FHSd3A-nogm9j_ktZReAHaW6fXUvROclC3GAVj4_G7XaeJhdu9ZDjyI0vid5J1y3dJX9rWTYgQATZ4SSc9jZI0"
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
                <h3 className="text-2xl font-bold text-white mb-2">Global Compliance</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 group-hover:text-slate-200 transition-colors">Automated customs documentation and regulatory checks for over 190 jurisdictions.</p>
                <div className="h-[1px] w-full bg-gradient-to-r from-primary/50 to-transparent mb-4 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-background-dark border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 reveal-trigger">
            <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2 block">Marketplace</span>
            <h2 className="text-5xl font-bold text-white">TRENDING CATEGORIES</h2>
          </div>

          <div
            className="flex justify-center items-center h-[500px] poker-deck reveal-trigger"
            ref={pokerDeckRef}
            onMouseEnter={setPokerReadyAfterAnimation}
            onMouseLeave={clearPokerReady}
            onFocus={setPokerReadyAfterAnimation}
            onBlur={clearPokerReady}
          >
            <div className="w-[300px] h-[420px] absolute bg-surface-dark rounded-2xl border border-white/10 overflow-hidden poker-card cursor-pointer group">
              <img alt="Luxury minimalist clothing" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGJAINthV2SEgWajgPH428NG66vtDwIuJIhFUvc2NgY7yCBAXSF-toT36X9GvtI4y_teyIZDgQtLnIEdp6-4n9An8S9yuukPsWrF_elBG573vIoOg3uNZ0yrXqKiUJImJr5pIjKs5yFLQDuaWM-nZH-VQHb6ryNSg4W7NyaLJXRSUbp6qOKknIAhFPSwLJFBnr8sh-Q3x0vcsFq_ZIuAJauu8dM0WtQj3dXKxiPORpu5q_BmOvZsKR1sQUJO1hfYtpejs-vOV1h-8" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-primary text-xs font-bold uppercase mb-1">Source</p>
                <h4 className="text-2xl font-bold text-white">Luxury Goods</h4>
              </div>
            </div>
            <div className="w-[300px] h-[420px] absolute bg-surface-dark rounded-2xl border border-white/10 overflow-hidden poker-card cursor-pointer group z-[2]">
              <img alt="Computer chip close up" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjhrW_UQDgwqVE-6aMBLYLbQv6i5N5y7bC5SajqSjHPzt8UJUqbZ8a-7CbQBS5ZcMxeADv1LPgaIZcXs4D7xYqYlmKxuOZDFp6Wl-AdWq4sEEXVGkGURIO8IXEhMFjBxAIUpp_8HAfhfSSw-e5aknVjxqGYf3jiyfl0h5rBHLYBkf6CAPQnchcVDlTZzGiYbDn-4NCCykQgqaACpE53XGjDC7NgbYcMcm7dGI4dioMptR_CfI6Rg4EIwaZ3T1TkPlP-xl7tJ0YHAQ" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-primary text-xs font-bold uppercase mb-1">Source</p>
                <h4 className="text-2xl font-bold text-white">Electronics</h4>
              </div>
            </div>
            <div className="w-[300px] h-[420px] absolute bg-surface-dark rounded-2xl border border-white/10 overflow-hidden poker-card cursor-pointer group z-[3]">
              <img alt="Industrial raw metal materials" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9Bc88m8O11l_cbqn7bF__ywxVWWueCoosbhNBofiTCk0DRdT6tCnGuQlWbEk5qICLTpZSVEF3VWk35BzlEXlBX13ecZoHLYf1PsoMAWx-W53ioZRuwcdDm8cb0AqjqkCO5ZVbTzJroYM4HUIxWh12Y5JtdHz4ksawx_cN--_7fjtiilqXBQz-YzWImjr8RDUxcmrsquuG_elQB0Rj2WRFLLoJ5WbCsn_Gd3fib_TVpy-S2ggl69SJZkxVOWJT6hRnLgiGwlp1cec" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-primary text-xs font-bold uppercase mb-1">Source</p>
                <h4 className="text-2xl font-bold text-white">Raw Materials</h4>
              </div>
            </div>
            <div className="w-[300px] h-[420px] absolute bg-surface-dark rounded-2xl border border-white/10 overflow-hidden poker-card cursor-pointer group z-[4]">
              <img alt="Electric vehicle charging" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA69LSELe9Cx1tL3UYR_K6CETFwiiWlf-pkfJBqCViaWIpMLq4tn3rR82g9F00MYIMHcC-OdvebYLsKvbZ8fTZEc0nmiAx9UgGRMwXPw28bk2AwZRTpn-jq0umzDDtC6mN4f-oxLj82qmnjGmAfaVNJo1QgY1yUKJK6wly_WP2D0PcBKgyQWQWPtXCljyYtQk3n_iO3tXZMw0FsEKSy0xBo8rtjnP5xZzc7m9tdFFLcIEFE7BaDAdPLaSthANtZh1XiEQRjy415xoA" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-primary text-xs font-bold uppercase mb-1">Source</p>
                <h4 className="text-2xl font-bold text-white">Automotive</h4>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-500 mt-12 text-sm italic reveal-trigger">Hover to browse categories</p>
        </div>
      </section>

      <section className="py-24 relative bg-surface-dark">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 reveal-trigger">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl glass-card p-1 group">
              <div className="shimmer-bg rounded-xl overflow-hidden h-[450px]">
                <img alt="Night view of Singapore port lights" className="w-full h-full object-cover filter brightness-90 contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-bOGud8tNrRNFyPUp6qLGZGIUs1FytDZd5G3830a38J9VWFLoAp1Kx09VhvmWRRX4Pizn2vJzaMDaL70NNL03asHw5NOkXJ_HEKiE-6xYvdUksOkI21-7Uxo4ua-ojc0a3IrRx7qHaYIA4rd_AUk8rU-9aAzthWRVmJm45KqjSSmLLSseAnvHuPjo6y7c-QM2UeL_KqrOb_q_k6Nn7ov1MxAk6rDAanoQG6tJlB-DVco3N9V8rB8lmehgDBB8A1TivKIkbfaHNcY" />
              </div>
              <div
                className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-xl transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500"
                style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                  <span className="text-sm text-white font-bold uppercase tracking-wider">Singapore Hub</span>
                </div>
                <div className="text-xs text-slate-400 space-y-2">
                  <p className="flex justify-between w-48 border-b border-white/5 pb-1"><span>Inbound:</span> <span className="text-white font-mono">4,210 TEU</span></p>
                  <p className="flex justify-between w-48"><span>Outbound:</span> <span className="text-white font-mono">8,102 TEU</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-8 reveal-trigger" style={{ transitionDelay: "200ms" }}>
            <h2 className="text-5xl font-bold text-white">STRATEGIC <br /><span className="text-primary">GLOBAL HUBS</span></h2>
            <p className="text-slate-400 text-lg leading-relaxed">Our physical presence in 40+ major logistical hubs ensures your goods are handled with priority. From Singapore to Rotterdam, we provide on-ground support.</p>
            <div className="space-y-4 pt-4">
              <div className="group flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/[0.07] transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">01</div>
                <div>
                  <h4 className="text-white font-bold text-lg">Expedited Clearance</h4>
                  <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">Average 4 hours processing time</p>
                </div>
              </div>
              <div className="group flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/[0.07] transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">02</div>
                <div>
                  <h4 className="text-white font-bold text-lg">Warehousing Network</h4>
                  <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">2.5M sq ft of secure storage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background-dark/80 to-background-dark" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center reveal-on-scroll">
          <h2 className="text-5xl md:text-7xl font-bold text-primary mb-8 tracking-tight drop-shadow-xl">
            READY TO SCALE?
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join over 10,000 global enterprises transforming their supply chain with <span className="text-white">Renote Exim</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-5 px-12 rounded-xl primary-glow transition-all duration-300 text-lg shadow-xl hover:-translate-y-1 primary-glow-hover"
              href="/register"
            >
              Join the Network
            </Link>
            <Link
              className="w-full sm:w-auto text-white border border-white/20 hover:bg-white/5 font-bold py-5 px-12 rounded-xl transition-all duration-300 text-lg hover:-translate-y-1"
              href="/contact"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-background-dark border-t border-white/5 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
                  <span className="material-icons text-sm">public</span>
                </div>
                <span className="text-xl font-bold tracking-wide text-white">
                  RENOTE<span className="text-primary">EXIM</span>
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Reimagining global trade infrastructure for the digital age. Secure, fast, and transparent.
              </p>
              <div className="flex gap-4">
                <a
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors"
                  href="#"
                  aria-label="Facebook"
                >
                  <i className="material-icons text-sm">facebook</i>
                </a>
                <a
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors"
                  href="#"
                  aria-label="Work"
                >
                  <i className="material-icons text-sm">work</i>
                </a>
                <a
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-colors"
                  href="#"
                  aria-label="Community"
                >
                  <i className="material-icons text-sm">flutter_dash</i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>
                  <Link className="hover:text-primary transition-colors" href="/products">
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" href="/dashboard/admin/shipments">
                    Logistics
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" href="/dashboard/admin/analytics">
                    Finance
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" href="/dashboard/admin/notifications">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>
                  <Link className="hover:text-primary transition-colors" href="/about">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" href="/careers">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" href="/press">
                    Press
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" href="/contact">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Subscribe</h4>
              <p className="text-slate-500 text-sm mb-4">Get the latest trade insights.</p>
              <div className="flex">
                <input
                  className="bg-white/5 border border-white/10 text-white rounded-l-lg px-4 py-3 text-sm w-full focus:outline-none focus:border-primary transition-colors"
                  placeholder="Email address"
                  type="email"
                />
                <button className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 transition-colors primary-glow-hover" type="button" aria-label="Subscribe">
                  <span className="material-icons text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
            <p>© 2026 Renote Exim. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <Link className="hover:text-slate-400 transition-colors" href="/privacy">
                Privacy Policy
              </Link>
              <Link className="hover:text-slate-400 transition-colors" href="/terms">
                Terms of Service
              </Link>
              <Link className="hover:text-slate-400 transition-colors" href="/cookies">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
