"use client";

import { TrendingDown, TrendingUp, Anchor, Package, Building2, Store, Briefcase, Globe, Factory, Zap, Gem, Tractor, ShieldCheck, Check, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import TrendingCategories from "@/components/ui/TrendingCategories";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const pokerDeckRef = useRef<HTMLDivElement | null>(null);
  const pokerReadyTimeoutRef = useRef<number | null>(null);
  const shipRef = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const airplaneRef = useRef<HTMLImageElement>(null);
  const connectivitySectionRef = useRef<HTMLElement>(null);
  const bulkSectionRef = useRef<HTMLElement>(null);
  const bulkHeadingRef = useRef<HTMLDivElement>(null);
  const bulkMainCardRef = useRef<HTMLDivElement>(null);
  const bulkSubCardsRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

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

    const heroGlobes = document.querySelectorAll<HTMLElement>(".parallax-globe");
    const onScroll = () => {
      if (heroGlobes.length === 0) return;
      const scrolled = window.scrollY;

      const viewportHeight = window.innerHeight;
      const moveSpeed = 0.04;
      const initialY = 20; // Starting Y percentage
      const newY = initialY + scrolled * moveSpeed;

      const rotation = scrolled * 0.02;
      const scale = 1.05 + scrolled * 0.0003;

      heroGlobes.forEach(globe => {
        globe.style.backgroundPosition = `center ${newY}%`;
        globe.style.transform = `scale(${scale}) rotate(${rotation}deg)`;

        // Optional dark-theme specific opacity fading
        if (globe.id === "hero-globe-dark") {
          if (scrolled > viewportHeight) {
            globe.style.opacity = "0.4";
          } else {
            const opacity = Math.min(1, Math.max(0.4, 0.4 + scrolled * 0.0001));
            globe.style.opacity = String(opacity);
          }
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      triggerObserver.disconnect();
      scrollObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (shipRef.current && sectionRef.current) {
      gsap.fromTo(shipRef.current,
        {
          x: "30vw",
          y: "-30vh"
        },
        {
          x: "-30vw",
          y: "30vh", // Move the ship diagonally down and left
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom", // Start animation when section enters the screen
            end: "bottom top",   // End when section leaves the top
            scrub: 1,            // Smooth scrubbing effect tied to scrollbar
          }
        }
      );
    }

    if (airplaneRef.current && connectivitySectionRef.current) {
      gsap.fromTo(airplaneRef.current,
        {
          x: "0vw",
          y: "80vh"
        },
        {
          x: "0vw",
          y: "-80vh", // Move the airplane straight up vertically
          ease: "none",
          scrollTrigger: {
            trigger: connectivitySectionRef.current,
            start: "top bottom", // Start animation when section enters the screen
            end: "bottom top",   // End when section leaves the top
            scrub: 1,            // Smooth scrubbing effect tied to scrollbar
          }
        }
      );
    }

    if (bulkSectionRef.current && bulkHeadingRef.current && bulkMainCardRef.current && bulkSubCardsRef.current) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: bulkSectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        }
      });

      tl.fromTo(bulkHeadingRef.current,
        { scale: 0.5, y: 100, opacity: 0, rotationX: 45 },
        { scale: 1, y: 0, opacity: 1, rotationX: 0, duration: 1, ease: "elastic.out(1, 0.5)" }
      )
        .fromTo(bulkMainCardRef.current,
          { x: -200, opacity: 0, rotationY: 45 },
          { x: 0, opacity: 1, rotationY: 0, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        )
        .fromTo(bulkSubCardsRef.current.children,
          { x: 200, opacity: 0, rotationY: -45, scale: 0.8 },
          { x: 0, opacity: 1, rotationY: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: "back.out(1.5)" },
          "-=0.6"
        );
    }
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display selection:bg-primary selection:text-white overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-[#101622]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold primary-glow-hover">
              <span className="material-icons text-sm">public</span>
            </div>
            <span className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">
              RANOTE<span className="text-primary">EXIM</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link className="hover:text-primary dark:hover:text-white transition-colors" href="/products">
              Marketplace
            </Link>
            <Link className="hover:text-primary dark:hover:text-white transition-colors" href="/dashboard/admin/shipments">
              Logistics
            </Link>
            <Link className="hover:text-primary dark:hover:text-white transition-colors" href="/dashboard/admin/analytics">
              Data
            </Link>
            <Link className="hover:text-primary dark:hover:text-white transition-colors" href="/contact">
              Enterprise
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!loading && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-10 h-10 rounded-full border-2 border-primary/40 flex items-center justify-center overflow-hidden hover:border-primary transition-colors focus:outline-none bg-slate-100 dark:bg-transparent"
                >
                  {user.avatar ? (
                    <Image src={user.avatar as string} alt="Profile" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <span className="material-icons text-slate-600 dark:text-white text-lg">person</span>
                  )}
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#101622]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 mb-2">
                      <p className="text-sm text-slate-900 dark:text-white font-bold truncate tracking-wide">{user.name || "User"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href={`/dashboard/${user.role.toLowerCase()}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="material-icons text-sm text-primary">dashboard</span>
                      Dashboard
                    </Link>
                    <Link
                      href={`/dashboard/${user.role.toLowerCase()}/settings`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-white transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="material-icons text-sm text-primary">settings</span>
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 mt-1 border-t border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors text-left"
                    >
                      <span className="material-icons text-sm">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link className="hidden md:block text-sm font-medium text-slate-700 dark:text-white hover:text-primary dark:hover:text-primary transition-colors" href="/login">
                  Login
                </Link>
                <Link className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2 px-6 rounded-lg primary-glow transition-all duration-300 transform hover:scale-105 primary-glow-hover" href="/register">
                  Get Started
                </Link>
              </>
            )}
            <button className="md:hidden text-slate-900 dark:text-white" type="button" aria-label="Menu">
              <span className="material-icons">menu</span>
            </button>
          </div>
        </div>
      </nav>

      <header className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-20 pb-12 bg-slate-50 dark:bg-background-dark transition-colors duration-500">
        <div className="absolute inset-0 z-0">
          {/* Light Theme Globe Drop-in */}
          <div
            className="parallax-globe absolute inset-0 bg-[url('/assets/globe_light_theme.png')] bg-cover bg-center dark:hidden opacity-100"
            id="hero-globe-light"
            style={{ backgroundPosition: "center 20%", transform: "scale(1.05)" }}
            aria-hidden="true"
          />
          {/* Dark Theme Globe Drop-in */}
          <div
            className="parallax-globe absolute inset-0 hidden dark:block bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-screen transition-transform duration-100 ease-linear"
            id="hero-globe-dark"
            style={{ backgroundPosition: "center 30%", transform: "scale(1.1)" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:from-background-dark/90 dark:via-transparent dark:to-background-dark transition-colors duration-500 pointer-events-none" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent dark:from-background-dark/80 dark:via-transparent dark:to-background-dark/80 transition-colors duration-500 pointer-events-none" aria-hidden="true" />
          <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] animate-pulse transition-opacity duration-500 opacity-20 dark:opacity-100 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-1/3 right-1/4 w-[35rem] h-[35rem] bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-[140px] transition-opacity duration-500 opacity-20 dark:opacity-100 pointer-events-none" aria-hidden="true" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center justify-center h-full mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-primary/30 mb-10 animate-[float_4s_ease-in-out_infinite] bg-white/60 dark:bg-[#101622]/80 backdrop-blur-md transition-colors duration-500 shadow-sm dark:shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-500" />
            </span>
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Global Network Active</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight leading-none drop-shadow-2xl transition-colors duration-500">
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

          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light drop-shadow-lg transition-colors duration-500">
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
              className="w-full sm:w-1/2 hover:bg-white/80 dark:hover:bg-white/10 text-slate-900 dark:text-white font-semibold py-5 px-8 rounded-xl transition-all duration-300 text-lg flex items-center justify-center gap-2 border border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 hover:-translate-y-1 bg-white/40 dark:bg-[#101622]/60 backdrop-blur-xl shadow-lg"
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

      <section className="py-16 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-white/5 relative reveal-on-scroll active">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center md:text-left border-r border-slate-200 dark:border-white/5 last:border-0 pr-4 group hover:bg-slate-50 dark:hover:bg-white/5 p-4 rounded transition-colors">
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">2.4M+</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Shipments Tracked</p>
          </div>
          <div className="text-center md:text-left border-r border-slate-200 dark:border-white/5 last:border-0 pr-4 group hover:bg-slate-50 dark:hover:bg-white/5 p-4 rounded transition-colors">
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">$85B</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Trade Volume</p>
          </div>
          <div className="text-center md:text-left border-r border-slate-200 dark:border-white/5 last:border-0 pr-4 group hover:bg-slate-50 dark:hover:bg-white/5 p-4 rounded transition-colors">
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">190+</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Countries Served</p>
          </div>
          <div className="text-center md:text-left pr-4 group hover:bg-slate-50 dark:hover:bg-white/5 p-4 rounded transition-colors">
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">0.01s</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Data Latency</p>
          </div>
        </div>
      </section>

      {/* Inject TrendingCategories GSAP Integration Here */}
      <TrendingCategories />

      <section className="py-24 relative overflow-hidden bg-slate-100 dark:bg-surface-dark">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 reveal-trigger">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                ENGINEERED FOR <br />
                <span className="text-primary">MODERN LOGISTICS</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Our platform combines institutional-grade financial tools with real-time supply chain visibility.</p>
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

      <section ref={sectionRef} className="py-24 relative bg-slate-50 dark:bg-[#0A0E17] overflow-hidden flex items-center min-h-[90vh]">
        {/* Static Port Background Image (from original layout) */}
        <div className="absolute top-0 right-0 w-full md:w-[60%] h-full z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 dark:from-[#0A0E17] via-slate-50/80 dark:via-[#0A0E17]/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#0A0E17] via-transparent to-slate-50 dark:to-[#0A0E17] z-10 opacity-60" />
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?q=80&w=2070"
            alt="Container Port"
            width={1200} height={800}
            className="w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-luminosity filter contrast-125"
          />
        </div>

        {/* Animated Custom Cargo Ship */}
        <div className="absolute inset-0 pointer-events-none z-[5] flex justify-center items-center opacity-90 overflow-visible">
          <Image
            ref={shipRef}
            src="/custom-ship-2.png"
            alt="Cargo Ship"
            width={1200} height={800}
            className="w-[1200px] max-w-none object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
            unoptimized
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16 relative z-10 w-full">
          <div className="w-full md:w-[45%] reveal-trigger">
            <div className="relative rounded-2xl overflow-hidden glass-card p-8 border border-white/60 dark:border-white/10 shadow-2xl bg-white/60 dark:bg-[#0A0E17]/60 backdrop-blur-xl">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Strategic Global Hubs</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-sm">
                Our network of strategically located port facilities ensures your cargo never stops moving. From Shanghai to Rotterdam, we maintain priority access and dedicated customs channels.
              </p>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold">Singapore Port</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Asia Pacific Hub</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 rounded-full text-[10px] uppercase font-bold tracking-widest">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold">Port of Rotterdam</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">EMEA Gateway</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 rounded-full text-[10px] uppercase font-bold tracking-widest">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold">Port of Los Angeles</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Americas Terminal</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30 rounded-full text-[10px] uppercase font-bold tracking-widest">CONGESTED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[55%] space-y-8 reveal-trigger pl-0 md:pl-10" style={{ transitionDelay: "200ms" }}>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">STRATEGIC <br /><span className="text-primary">GLOBAL HUBS</span></h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-xl">Our physical presence in 40+ major logistical hubs ensures your goods are handled with priority. From Singapore to Rotterdam, we provide on-ground support.</p>
            <div className="space-y-4 pt-4 max-w-xl">
              <div className="group flex items-center gap-6 p-6 rounded-2xl bg-white/40 dark:bg-[#0A0E17]/40 backdrop-blur-sm border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm dark:shadow-[0_0_15px_rgba(19,91,236,0.3)]">01</div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-bold text-lg">Expedited Clearance</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Average 4 hours processing time</p>
                </div>
              </div>
              <div className="group flex items-center gap-6 p-6 rounded-2xl bg-white/40 dark:bg-[#0A0E17]/40 backdrop-blur-sm border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm dark:shadow-[0_0_15px_rgba(19,91,236,0.3)]">02</div>
                <div>
                  <h4 className="text-slate-900 dark:text-white font-bold text-lg">Warehousing Network</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">2.5M sq ft of secure storage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reverse Marquee */}
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
          {/* Duplicate for seamless looping */}
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

      {/* Bulk Procurement Solutions */}
      <section ref={bulkSectionRef} className="relative z-20 overflow-hidden border-b border-slate-200 dark:border-white/5" style={{ perspective: '1500px' }}>
        {/* Split Background Layer */}
        <div className="absolute inset-0 flex flex-col lg:flex-row pointer-events-none -z-10 bg-slate-50 dark:bg-[#0B0E14]">
          <div
            className="w-full lg:w-1/2 h-full relative"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, black 70%, transparent 100%)',
              maskImage: 'linear-gradient(to right, black 70%, transparent 100%)'
            }}
          >
            <Image
              src="/bulk-warehouse.png"
              alt="Warehouse Operations"
              fill
              className="object-cover"
              priority
            />
            {/* Mobile overlay for contrast */}
            <div className="absolute inset-0 bg-white/60 dark:bg-[#0B0E14]/70 lg:hidden"></div>
            {/* Top mask for the title so text remains ultra-legible */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white to-transparent dark:from-[#0B0E14] dark:to-transparent opacity-80"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div ref={bulkHeadingRef} className="text-center mb-16 opacity-0">
            <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2 block">Enterprise Sourcing</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">BULK PROCUREMENT <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">SOLUTIONS</span></h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div ref={bulkMainCardRef} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/50 dark:border-white/10 relative overflow-hidden shadow-2xl opacity-0 flex flex-col justify-center h-full max-w-xl mx-auto lg:mr-auto">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center mb-6 shadow-sm relative z-10">
                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 stroke-[1.5]" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 relative z-10">Verified Global Suppliers</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8 max-w-sm relative z-10">
                Access a curated network of 50,000+ top-tier manufacturers. We audit every factory for compliance, capacity, and financial stability so you can source with total confidence.
              </p>
              <ul className="space-y-4 mb-8 relative z-10">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0 stroke-[3]" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Factory Audits &amp; Certifications</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0 stroke-[3]" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Quality Control Inspections</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0 stroke-[3]" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Trade Finance Support</span>
                </li>
              </ul>
              <div className="mt-auto relative z-10">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 group/btn max-w-max text-sm shadow-lg shadow-blue-500/20">
                  Request Bulk Quote
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div ref={bulkSubCardsRef} className="grid grid-cols-1 gap-4" style={{ perspective: '1000px' }}>
              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 shadow-sm dark:border-white/5 dark:shadow-none hover:border-primary/50 transition-all duration-300 flex items-center gap-6 group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 opacity-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center relative">
                  <span className="absolute inset-0 bg-primary/20 animate-pulse rounded-lg"></span>
                  <span className="material-symbols-outlined text-2xl text-white relative z-10">diamond</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-primary transition-colors">Raw Metals &amp; Minerals</h4>
                  <p className="text-xs text-slate-500 mt-1">Copper, Lithium, Rare Earths</p>
                </div>
                <span className="material-icons text-slate-600 group-hover:text-white transition-colors">chevron_right</span>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 shadow-sm dark:border-white/5 dark:shadow-none hover:border-primary/50 transition-all duration-300 flex items-center gap-6 group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 opacity-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center relative">
                  <span className="absolute inset-0 bg-yellow-500/20 animate-pulse rounded-lg" style={{ animationDelay: '0.5s' }}></span>
                  <span className="material-symbols-outlined text-2xl text-white relative z-10">agriculture</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-primary transition-colors">Global Agriculture</h4>
                  <p className="text-xs text-slate-500 mt-1">Wheat, Soy, Coffee, Cotton</p>
                </div>
                <span className="material-icons text-slate-600 group-hover:text-white transition-colors">chevron_right</span>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 shadow-sm dark:border-white/5 dark:shadow-none hover:border-primary/50 transition-all duration-300 flex items-center gap-6 group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 opacity-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center relative">
                  <span className="absolute inset-0 bg-blue-500/20 animate-pulse rounded-lg" style={{ animationDelay: '1s' }}></span>
                  <span className="material-symbols-outlined text-2xl text-white relative z-10">bolt</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-primary transition-colors">Energy Solutions</h4>
                  <p className="text-xs text-slate-500 mt-1">Solar Panels, Batteries, Biofuels</p>
                </div>
                <span className="material-icons text-slate-600 group-hover:text-white transition-colors">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Connectivity */}
      <section ref={connectivitySectionRef} className="py-24 bg-slate-50 dark:bg-background-dark relative z-20 reveal-on-scroll overflow-hidden">
        {/* Animated Airplane */}
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-start overflow-visible">
          <Image ref={airplaneRef} src="/assets/airplane.png" alt="Airplane" width={1400} height={400} className="w-[1400px] max-w-none h-auto object-contain drop-shadow-[0_45px_65px_rgba(0,0,0,0.5)] -ml-[300px]" unoptimized />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2 block">Live Operations</span>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">REAL-TIME <br /><span className="text-primary">CONNECTIVITY</span></h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Track your supply chain down to the individual vessel. Our satellite network provides 24/7 visibility on all active shipments.</p>
            </div>
            <div className="flex items-center gap-4 mt-6 md:mt-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
                <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Maritime</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400 animate-pulse"></span>
                <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">Aviation</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[600px] bg-slate-200 dark:bg-[#080b12] rounded-2xl border border-slate-300 dark:border-white/10 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-20 dark:opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-no-repeat bg-center dark:invert dark:filter dark:brightness-50"></div>
            <div className="absolute inset-0">
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path className="stroke-primary/40 stroke-2 fill-none animate-[pathMove_3s_linear_infinite]" d="M 800 250 Q 500 200 200 250" strokeDasharray="10 10"></path>
                <path className="stroke-yellow-600/30 dark:stroke-yellow-500/30 stroke-2 fill-none animate-[pathMove_4s_linear_infinite]" d="M 550 200 Q 400 180 250 220" strokeDasharray="5 5"></path>
              </svg>
              <div className="map-dot top-[40%] left-[20%] animate-pulse" title="Vessel A"></div>
              <div className="map-dot top-[45%] left-[25%] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="map-dot top-[35%] left-[60%] animate-pulse" style={{ animationDelay: '1.2s' }}></div>
              <div className="map-dot top-[50%] left-[75%] animate-pulse" style={{ animationDelay: '0.8s' }}></div>
              <div className="map-dot bg-yellow-400 top-[30%] left-[40%] animate-[float_8s_linear_infinite]" style={{ boxShadow: '0 0 10px #facc15' }}></div>
              <div className="map-dot bg-yellow-400 top-[25%] left-[55%] animate-[float_10s_linear_infinite]" style={{ boxShadow: '0 0 10px #facc15' }}></div>

              <div className="absolute top-[38%] left-[22%] glass-panel p-3 rounded-lg border border-primary/30 transform transition-all hover:scale-105 cursor-pointer bg-white/80 dark:bg-black/20">
                <div className="text-[10px] text-primary font-bold mb-1">VESSEL: OCEAN PRIDE</div>
                <div className="text-[10px] text-slate-800 dark:text-white">ETA: LA PORT (14h)</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Cargo: Electronics</div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
              <div className="glass-panel p-4 rounded-xl border border-slate-300 dark:border-white/5 backdrop-blur-md bg-white/60 dark:bg-black/20">
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase mb-1">Active Vessels</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">1,492</p>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-slate-300 dark:border-white/5 backdrop-blur-md bg-white/60 dark:bg-black/20">
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase mb-1">Flights In-Air</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 font-mono">418</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Trade Compliance */}
      <section className="py-24 bg-[url('/assets/pexels-yankrukov-8867376.jpg')] bg-cover bg-top bg-fixed border-t border-slate-200 dark:border-white/5 relative z-20">
        <div className="absolute inset-0 bg-white/20 dark:bg-[#0B0E14]/80 backdrop-blur-[2px]"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10 reveal-on-scroll">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2 block drop-shadow-sm">Bureaucracy Simplified</span>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 drop-shadow-sm">SMART TRADE <br /><span className="text-primary">COMPLIANCE</span></h2>
            <p className="text-slate-700 dark:text-slate-300 max-w-2xl mx-auto font-medium drop-shadow-sm">Navigate complex international regulations with our AI-driven legal engine. We handle the paperwork so you can focus on the deal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card bg-white/70 dark:bg-[#0B0E14]/60 backdrop-blur-md p-8 rounded-xl border border-white/40 dark:border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 group shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors shadow-inner">
                <span className="material-symbols-outlined text-primary text-2xl">description</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Automated Customs</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
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

      <section className="py-32 relative overflow-hidden bg-slate-100 dark:bg-transparent">
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-white to-slate-100 dark:from-primary/20 dark:via-background-dark/80 dark:to-background-dark" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center reveal-on-scroll">
          <h2 className="text-5xl md:text-7xl font-bold text-primary mb-8 tracking-tight drop-shadow-xl">
            READY TO SCALE?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
            Join over 10,000 global enterprises transforming their supply chain with <span className="text-slate-900 dark:text-white font-semibold">Renote Exim</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold py-5 px-12 rounded-xl primary-glow transition-all duration-300 text-lg shadow-xl hover:-translate-y-1 primary-glow-hover"
              href="/register"
            >
              Join the Network
            </Link>
            <Link
              className="w-full sm:w-auto text-slate-900 dark:text-white border border-slate-300 dark:border-white/20 hover:bg-white/50 dark:hover:bg-white/5 font-bold py-5 px-12 rounded-xl transition-all duration-300 text-lg hover:-translate-y-1"
              href="/contact"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 dark:bg-background-dark border-t border-slate-200 dark:border-white/5 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
                  <span className="material-icons text-sm">public</span>
                </div>
                <span className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">
                  RANOTE<span className="text-primary">EXIM</span>
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed mb-6">
                Reimagining global trade infrastructure for the digital age. Secure, fast, and transparent.
              </p>
              <div className="flex gap-4">
                <a
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors"
                  href="#"
                  aria-label="Facebook"
                >
                  <i className="material-icons text-sm">facebook</i>
                </a>
                <a
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors"
                  href="#"
                  aria-label="Work"
                >
                  <i className="material-icons text-sm">work</i>
                </a>
                <a
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors"
                  href="#"
                  aria-label="Community"
                >
                  <i className="material-icons text-sm">flutter_dash</i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-500">
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
              <h4 className="text-slate-900 dark:text-white font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-500">
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
              <h4 className="text-slate-900 dark:text-white font-bold mb-6">Subscribe</h4>
              <p className="text-slate-600 dark:text-slate-500 text-sm mb-4">Get the latest trade insights.</p>
              <div className="flex shadow-sm rounded-l-lg">
                <input
                  className="bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-l-lg px-4 py-3 text-sm w-full focus:outline-none focus:border-primary transition-colors"
                  placeholder="Email address"
                  type="email"
                />
                <button className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 transition-colors primary-glow-hover" type="button" aria-label="Subscribe">
                  <span className="material-icons text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-600">
            <p>© 2026 Renote Exim. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <Link className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors" href="/privacy">
                Privacy Policy
              </Link>
              <Link className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors" href="/terms">
                Terms of Service
              </Link>
              <Link className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors" href="/cookies">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
