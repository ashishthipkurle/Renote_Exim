import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "@/lib/i18n/client";
import Plane2 from "@/assests/Plane2.png";

export default function ConnectivitySection() {
  const { t } = useTranslation();
  const airplaneRef = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [vesselCount, setVesselCount] = useState(0);
  const [flightCount, setFlightCount] = useState(0);

  // Animate counters on mount
  useEffect(() => {
    const targetVessels = 1492;
    const targetFlights = 418;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setVesselCount(Math.round(targetVessels * eased));
      setFlightCount(Math.round(targetFlights * eased));
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (airplaneRef.current && sectionRef.current) {
      gsap.fromTo(
        airplaneRef.current,
        { x: "0px", y: "800px" },
        {
          x: "0px",
          y: "-800px",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    }
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-slate-50 dark:bg-background relative z-20 reveal-on-scroll overflow-hidden">
      {/* Animated Airplane */}
      <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-start overflow-visible">
        <Image ref={airplaneRef} src={Plane2} alt="Airplane" width={1400} height={400} className="w-[1400px] max-w-none h-auto object-contain drop-shadow-[0_45px_65px_rgba(0,0,0,0.5)] -ml-[300px]" unoptimized />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-2xl">
            <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2 block">{t("connectivity.badge", "Live Operations")}</span>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t("connectivity.title_part1", "REAL-TIME")} <br /><span className="text-primary">{t("connectivity.title_part2", "CONNECTIVITY")}</span></h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">{t("connectivity.subtitle", "Track your supply chain down to the individual vessel. Our satellite network provides 24/7 visibility on all active shipments.")}</p>
          </div>
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
              <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">{t("connectivity.maritime", "Maritime")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400 animate-pulse"></span>
              <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">{t("connectivity.aviation", "Aviation")}</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[600px] bg-slate-200 dark:bg-[#080b12] rounded-lg border border-slate-300 dark:border-white/10 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-20 dark:opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-no-repeat bg-center dark:invert dark:filter"></div>
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path className="stroke-primary/40 stroke-2 fill-none animate-[pathMove_3s_linear_infinite]" d="M 800 250 Q 500 200 200 250" strokeDasharray="10 10"></path>
              <path className="stroke-yellow-600/30 dark:stroke-yellow-500/30 stroke-2 fill-none animate-[pathMove_4s_linear_infinite]" d="M 550 200 Q 400 180 250 220" strokeDasharray="5 5"></path>
            </svg>
            <div className="map-dot top-[40%] left-[20%] animate-pulse" title="Vessel A"></div>
            <div className="map-dot top-[45%] left-[25%] animate-pulse" style={{ animationDelay: "0.5s" }}></div>
            <div className="map-dot top-[35%] left-[60%] animate-pulse" style={{ animationDelay: "1.2s" }}></div>
            <div className="map-dot top-[50%] left-[75%] animate-pulse" style={{ animationDelay: "0.8s" }}></div>
            <div className="map-dot bg-yellow-400 top-[30%] left-[40%] animate-[float_8s_linear_infinite]" style={{ boxShadow: "0 0 10px #facc15" }}></div>
            <div className="map-dot bg-yellow-400 top-[25%] left-[55%] animate-[float_10s_linear_infinite]" style={{ boxShadow: "0 0 10px #facc15" }}></div>

            <div className="absolute top-[38%] left-[22%] glass-panel p-3 rounded-lg border border-primary/30 transform transition-all hover:scale-105 cursor-pointer bg-white/80 dark:bg-black/20">
              <div className="text-[10px] text-primary font-bold mb-1">{t("connectivity.vessel_label", "VESSEL")}: OCEAN PRIDE</div>
              <div className="text-[10px] text-slate-800 dark:text-white">{t("connectivity.eta_label", "ETA")}: LA PORT (14h)</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400">{t("connectivity.cargo_label", "Cargo")}: Electronics</div>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
            <div className="glass-panel p-4 rounded-xl border border-slate-300 dark:border-white/5 backdrop-blur-md bg-white/60 dark:bg-black/20">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase mb-1">{t("connectivity.active_vessels", "Active Vessels")}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{vesselCount.toLocaleString()}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-slate-300 dark:border-white/5 backdrop-blur-md bg-white/60 dark:bg-black/20">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase mb-1">{t("connectivity.flights_in_air", "Flights In-Air")}</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 font-mono">{flightCount}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
