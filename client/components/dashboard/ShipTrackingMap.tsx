"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { authFetch } from "@/lib/api-utils";
import { Globe, RefreshCw, Ship, Plane, Anchor } from "lucide-react";

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
function LeafletMapInner({ routes }: { routes: LiveRoute[] }) {
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

    // Dark theme tiles from CartoDB
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
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
      const color = route.type === "air" ? "#818cf8" : "#22d3ee";

      // Draw the shipping route line
      const routeLine = L.polyline([fromLatLng, toLatLng], {
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
      const isIndianPort = from?.lat && from.lat > 6 && from.lat < 35 && from.lng > 68 && from.lng < 98;
      const originIcon = L.divIcon({
        className: "",
        html: `<div style="
          width: 14px; height: 14px; border-radius: 50%;
          background: ${isIndianPort ? "#fbbf24" : color};
          border: 2px solid white;
          box-shadow: 0 0 12px ${isIndianPort ? "#fbbf2488" : color + "88"};
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker(fromLatLng, { icon: originIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:monospace;font-size:12px">
            <b style="color:${isIndianPort ? "#fbbf24" : color}">📦 ORIGIN</b><br/>
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
            <b style="color:${color}">🏁 DESTINATION</b><br/>
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
              <b style="color:#22d3ee">🚢 VESSEL POSITION</b><br/>
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
          background: #0f172a !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(34, 211, 238, 0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.15) !important;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
          border-color: rgba(34, 211, 238, 0.3) !important;
        }
        .leaflet-control-zoom a {
          background: #1e293b !important;
          color: #94a3b8 !important;
          border-color: #334155 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #334155 !important;
          color: white !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        style={{ background: "#0a1628" }}
      />
    </>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────
export default function ShipTrackingMap() {
  const [routes, setRoutes] = useState<LiveRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    authFetch<{ routes: LiveRoute[]; total: number }>("/api/shipments/active")
      .then((d) => {
        if (d?.routes) {
          setRoutes(d.routes);
          setLastUpdate(new Date());
        }
      })
      .catch((err) => {
        console.error("[ShipMap] Failed to load routes:", err);
        setRoutes([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Manual refresh only — no auto-refresh

  return (
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden bg-[#0a1628] border border-white/5">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 z-20 relative border-b border-white/5">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-bold text-white tracking-tight">
                India Global Trade Network
              </h2>
              <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                routes.length > 0
                  ? "bg-green-500/12 border-green-500/30 text-green-400"
                  : "bg-slate-500/12 border-slate-500/30 text-slate-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  routes.length > 0 ? "bg-green-400" : "bg-slate-400"
                }`} />
                {routes.length > 0 ? "LIVE" : "NO ROUTES"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {routes.length} active route{routes.length !== 1 ? "s" : ""}
              {lastUpdate && <span> · {lastUpdate.toLocaleTimeString()}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey((n) => n + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        {/* Import Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />

        {routes.length === 0 && !loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Ship className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-500 text-sm">No active shipments to track</p>
              <p className="text-slate-600 text-xs">Routes will appear here when you ship goods</p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a1628]">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-sm">Loading live tracking...</p>
            </div>
          </div>
        ) : null}

        <LeafletMapInner routes={routes} />
      </div>

      {/* Footer stats */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-2 border-t border-white/5 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Plane className="w-3 h-3" />
            Air {routes.filter((r) => r.type === "air").length}
          </span>
          <span className="flex items-center gap-1">
            <Anchor className="w-3 h-3" />
            Ocean {routes.filter((r) => r.type === "ocean").length}
          </span>
        </div>
        <span className="text-cyan-400/60 text-[10px]">
          Only showing your active shipments
        </span>
      </div>
    </div>
  );
}
