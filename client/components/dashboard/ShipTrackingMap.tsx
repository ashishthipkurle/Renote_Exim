"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { authFetch } from "@/lib/api-utils";
import { Globe, RefreshCw, Ship, Plane, Anchor } from "lucide-react";
import { useTheme } from "next-themes";

// ── Types ────────────────────────────────────────────────────────────────────
interface LiveRoute {
  id: string;
  fromPort: string;
  toPort: string;
  type: "ocean" | "air" | "land";
  status: string;
  vessel?: string;
  cargo?: string;
  lat?: number;
  lng?: number;
  lastLocation?: string;
  importer?: string;
}

// ── Port coordinates for mapping port codes to real lat/lng ──────────────────
const PORT_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  MUMBAI:        { lat: 19.08,  lng: 72.88,   name: "Mumbai" },
  NHAVA_SHEVA:   { lat: 18.95,  lng: 72.95,   name: "JNPT Nhava Sheva" },
  DELHI:         { lat: 28.61,  lng: 77.10,   name: "Delhi" },
  CHENNAI:       { lat: 13.08,  lng: 80.28,   name: "Chennai" },
  KOLKATA:       { lat: 22.57,  lng: 88.37,   name: "Kolkata" },
  KANDLA:        { lat: 23.00,  lng: 70.22,   name: "Kandla" },
  COCHIN:        { lat: 9.96,   lng: 76.27,   name: "Kochi" },
  VIZAG:         { lat: 17.70,  lng: 83.32,   name: "Visakhapatnam" },
  BENGALURU:     { lat: 12.97,  lng: 77.59,   name: "Bangalore" },
  DUBAI:         { lat: 25.20,  lng: 55.30,   name: "Dubai" },
  JEDDAH:        { lat: 21.48,  lng: 39.17,   name: "Jeddah" },
  SINGAPORE:     { lat: 1.29,   lng: 103.82,  name: "Singapore" },
  HONG_KONG:     { lat: 22.32,  lng: 114.16,  name: "Hong Kong" },
  SHANGHAI:      { lat: 31.23,  lng: 121.47,  name: "Shanghai" },
  TOKYO:         { lat: 35.68,  lng: 139.69,  name: "Tokyo" },
  BUSAN:         { lat: 35.10,  lng: 129.05,  name: "Busan" },
  ROTTERDAM:     { lat: 51.93,  lng: 4.48,    name: "Rotterdam" },
  HAMBURG:       { lat: 53.55,  lng: 9.99,    name: "Hamburg" },
  ANTWERP:       { lat: 51.22,  lng: 4.40,    name: "Antwerp" },
  LONDON:        { lat: 51.51,  lng: -0.12,   name: "London" },
  NEW_YORK:      { lat: 40.71,  lng: -74.01,  name: "New York" },
  LOS_ANGELES:   { lat: 34.05,  lng: -118.24, name: "Los Angeles" },
  MOMBASA:       { lat: -4.06,  lng: 39.67,   name: "Mombasa" },
  LAGOS:         { lat: 6.45,   lng: 3.38,    name: "Lagos" },
  SYDNEY:        { lat: -33.87, lng: 151.21,  name: "Sydney" },
  COLOMBO:       { lat: 6.92,   lng: 79.84,   name: "Colombo" },
  BANGKOK:       { lat: 13.75,  lng: 100.52,  name: "Bangkok" },
};

// ── The actual Leaflet map (loaded dynamically to avoid SSR) ────────────────
function LeafletMapInner({ routes, theme }: { routes: LiveRoute[], theme?: string }) {
  const mapRef = useRef<any>(null);
  const [L, setL] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import Leaflet on client
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  useEffect(() => {
    if (!L || !containerRef.current || mapReady) return;

    // Fix Leaflet default icon issue in webpack/next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    // Create map centered on Indian Ocean
    const map = L.map(containerRef.current, {
      center: [20, 60],
      zoom: 3,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      worldCopyJump: false,
      maxBounds: [[-85, -180], [85, 180]],
      maxBoundsViscosity: 1.0,
    });

    // Theme responsive tiles from CartoDB
    const isDark = theme === "dark";
    L.tileLayer(
      isDark 
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 19 }
    ).addTo(map);

    // Add zoom control to top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [L]);

  // Draw routes when data changes
  useEffect(() => {
    if (!L || !mapRef.current || !mapReady) return;
    const map = mapRef.current;

    // Clear existing layers (except the tile layer)
    map.eachLayer((layer: any) => {
      if (layer._url) return; // skip tile layer
      map.removeLayer(layer);
    });

    if (routes.length === 0) return;

    const allLatLngs: [number, number][] = [];

    routes.forEach((route) => {
      const from = PORT_COORDS[route.fromPort];
      const to = PORT_COORDS[route.toPort];
      if (!from && !to) return;

      const fromLatLng: [number, number] = from
        ? [from.lat, from.lng]
        : [20, 73]; // Default to Mumbai area
      const toLatLng: [number, number] = to
        ? [to.lat, to.lng]
        : [52, 4]; // Default to Rotterdam

      allLatLngs.push(fromLatLng, toLatLng);

      // Route color
      const color = "#ffffff";

      // Draw the shipping route line
      L.polyline([fromLatLng, toLatLng], {
        color,
        weight: 2.5,
        opacity: 0.7,
        dashArray: route.type === "ocean" ? "8 6" : undefined,
      }).addTo(map);

      // Glow effect (wider faint line behind)
      L.polyline([fromLatLng, toLatLng], {
        color,
        weight: 8,
        opacity: 0.15,
      }).addTo(map);

      // Origin port marker (golden for India)
      const originIcon = L.divIcon({
        className: "",
        html: `<div style="
          width: 14px; height: 14px; border-radius: 50%;
          background: white;
          border: 2px solid white;
          box-shadow: 0 0 12px rgba(255,255,255,0.4);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker(fromLatLng, { icon: originIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:monospace;font-size:12px">
            <b style="color:white">📦 ORIGIN</b><br/>
            <b>${from?.name || route.fromPort}</b><br/>
            Cargo: ${route.cargo || "N/A"}<br/>
            Vessel: ${route.vessel || "N/A"}
          </div>
        `);

      // Destination port marker
      const destIcon = L.divIcon({
        className: "",
        html: `<div style="
          width: 12px; height: 12px; border-radius: 50%;
          background: ${color};
          border: 2px solid white;
          box-shadow: 0 0 10px ${color}88;
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      L.marker(toLatLng, { icon: destIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:monospace;font-size:12px">
            <b style="color:white">🏁 DESTINATION</b><br/>
            <b>${to?.name || route.toPort}</b><br/>
            Buyer: ${route.importer || "N/A"}
          </div>
        `);

      // Ship current position (if GPS available)
      if (route.lat && route.lng) {
        const shipLatLng: [number, number] = [route.lat, route.lng];
        allLatLngs.push(shipLatLng);

        const shipIcon = L.divIcon({
          className: "",
          html: `<div style="position:relative">
            <div style="
              width: 20px; height: 20px; border-radius: 50%;
              background: radial-gradient(circle, #fff 20%, ${color} 60%, transparent 100%);
              box-shadow: 0 0 20px ${color};
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position:absolute; top:-1px; left:-1px;
              width: 22px; height: 22px; border-radius: 50%;
              border: 1.5px solid ${color};
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
          </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker(shipLatLng, { icon: shipIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:monospace;font-size:12px">
              <b style="color:white">🚢 VESSEL POSITION</b><br/>
              <b>${route.vessel || "Unknown Vessel"}</b><br/>
              Location: ${route.lastLocation || "At Sea"}<br/>
              Lat: ${route.lat.toFixed(4)}° Lng: ${route.lng.toFixed(4)}°<br/>
              Cargo: ${route.cargo || "N/A"}<br/>
              Destination: ${to?.name || route.toPort}
            </div>
          `);
      }
    });

    // Fit map bounds to show all points
    if (allLatLngs.length > 1) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
    }
  }, [L, routes, mapReady]);

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.8; }
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: white !important;
          color: #000000 !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 12px !important;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
        }
        .dark .leaflet-popup-content-wrapper {
          background: #000000 !important;
          color: #ffffff !important;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        .dark .leaflet-popup-tip {
          background: #000000 !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #64748b !important;
          border-color: #e2e8f0 !important;
        }
        .dark .leaflet-control-zoom a {
          background: #1e293b !important;
          color: #94a3b8 !important;
          border-color: #334155 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }
        .dark .leaflet-control-zoom a:hover {
          background: #334155 !important;
          color: white !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="absolute inset-0 z-0 bg-slate-100 dark:bg-background"
      />
    </>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────
export default function ShipTrackingMap({ 
  filter = "all", 
  routes: externalRoutes,
}: { 
  filter?: string; 
  routes?: LiveRoute[]; 
}) {
  const [internalRoutes, setInternalRoutes] = useState<LiveRoute[]>([]);
  const [loading, setLoading] = useState(!externalRoutes);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (externalRoutes) {
      setInternalRoutes(externalRoutes);
      setLoading(false);
      return;
    }
    setLoading(true);
    authFetch<{ routes: LiveRoute[]; total: number }>("/api/shipments/active")
      .then((d) => {
        if (d?.routes) {
          setInternalRoutes(d.routes);
          setLastUpdate(new Date());
        }
      })
      .catch((err) => {
        console.error("[ShipMap] Failed to load routes:", err);
        setInternalRoutes([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey, externalRoutes]);

  const displayRoutes = useMemo(() => {
    if (filter === "all") return internalRoutes;
    return internalRoutes.filter(r => {
      const port = r.toPort.toLowerCase();
      if (filter === "russia") return port.includes("russia");
      if (filter === "europe") return port.includes("london") || port.includes("rotterdam") || port.includes("antwerp") || port.includes("hamburg");
      if (filter === "usa") return port.includes("new_york") || port.includes("los_angeles");
      if (filter === "asia") return port.includes("singapore") || port.includes("shanghai") || port.includes("tokyo") || port.includes("busan") || port.includes("bangkok") || port.includes("hong_kong");
      if (filter === "africa") return port.includes("mombasa") || port.includes("lagos");
      return true;
    });
  }, [internalRoutes, filter]);

  // Manual refresh only — no auto-refresh

  return (
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-background border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
      {/* Header */}
      {!externalRoutes && (
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 z-20 relative border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-card/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-white flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                  India Global Trade Network
                </h2>
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                  internalRoutes.length > 0
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-neutral-500/12 border-neutral-500/30 text-neutral-400"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    internalRoutes.length > 0 ? "bg-white" : "bg-neutral-400"
                  }`} />
                  {internalRoutes.length > 0 ? "LIVE" : "NO ROUTES"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {internalRoutes.length} active route{internalRoutes.length !== 1 ? "s" : ""}
                {lastUpdate && <span> · {lastUpdate.toLocaleTimeString()}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRefreshKey((n) => n + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        {/* Import Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />

        {internalRoutes.length === 0 && !loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Ship className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-500 text-sm">No active shipments to track</p>
              <p className="text-slate-600 text-xs">Routes will appear here when you ship goods</p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-100 dark:bg-background">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Loading live tracking...</p>
            </div>
          </div>
        ) : null}

        <LeafletMapInner key={resolvedTheme} routes={displayRoutes} theme={resolvedTheme} />
      </div>

      {/* Footer stats */}
      {!externalRoutes && (
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-2 border-t border-slate-200 dark:border-white/5 text-[11px] text-slate-500 bg-white/50 dark:bg-transparent backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Plane className="w-3 h-3" />
              Air {internalRoutes.filter((r) => r.type === "air").length}
            </span>
            <span className="flex items-center gap-1">
              <Anchor className="w-3 h-3" />
              Ocean {internalRoutes.filter((r) => r.type === "ocean").length}
            </span>
          </div>
          <span className="text-white/40 text-[10px]">
            Only showing your active shipments
          </span>
        </div>
      )}
    </div>
  );
}
