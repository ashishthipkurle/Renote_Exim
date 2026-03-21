"use client";

import {
  useEffect, useState, useRef, useCallback, useMemo, memo
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp, AlertTriangle, Search, CalendarDays,
  Plus, RefreshCw, Layers, Wind, Anchor, Globe,
  ChevronRight, Activity, X, Package, DollarSign,
  ShoppingCart, Truck, Filter, ChevronDown,
} from "lucide-react";
import {
  authFetch, formatCurrency, formatNumber, timeAgo, getInitials,
} from "@/lib/api-utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ExporterStats {
  totalProducts: number; activeOrders: number;
  totalRevenue: number;  totalShipments: number;
}
interface OrderItem {
  id: string; orderNumber: string; totalPrice: number;
  status: string; createdAt: string;
  product: { name: string; category?: string };
  importer: { name: string; companyName: string | null; country: string | null };
}
interface CategoryRevenue { category: string; revenue: number; orderCount: number }
interface Partner {
  id: string; name: string; companyName: string | null;
  country: string | null; verified: boolean;
  orderCount: number; totalValue: number;
}
interface ShipmentRoute {
  id: string; fromPort: string; toPort: string;
  type: "air" | "ocean" | "land"; status: string;
  vessel?: string; cargo?: string; progress?: number; color?: string;
}

// Dashboard filter periods
type PeriodFilter = "today" | "week" | "month" | "quarter" | "year" | "all";
const PERIOD_LABELS: Record<PeriodFilter, string> = {
  today: "Today", week: "This Week", month: "This Month",
  quarter: "This Quarter", year: "This Year", all: "All Time",
};

// ─────────────────────────────────────────────────────────────────────────────
// Port Database
// ─────────────────────────────────────────────────────────────────────────────
const PORT_DB: Record<string, { lng: number; lat: number; name: string; country: string; type: string; india?: boolean }> = {
  // India — true geographic coords
  MUMBAI:        { lng:72.88,  lat:19.08,  name:"Mumbai",        country:"India",        type:"both",    india:true },
  DELHI:         { lng:77.10,  lat:28.61,  name:"Delhi",         country:"India",        type:"airport", india:true },
  CHENNAI:       { lng:80.28,  lat:13.08,  name:"Chennai",       country:"India",        type:"both",    india:true },
  KOLKATA:       { lng:88.37,  lat:22.57,  name:"Kolkata",       country:"India",        type:"both",    india:true },
  KANDLA:        { lng:70.22,  lat:23.00,  name:"Kandla",        country:"India",        type:"port",    india:true },
  COCHIN:        { lng:76.27,  lat:9.96,   name:"Kochi",         country:"India",        type:"both",    india:true },
  NHAVA_SHEVA:   { lng:72.95,  lat:18.95,  name:"JNPT",          country:"India",        type:"port",    india:true },
  VIZAG:         { lng:83.32,  lat:17.70,  name:"Visakhapatnam", country:"India",        type:"port",    india:true },
  BENGALURU:     { lng:77.59,  lat:12.97,  name:"Bangalore",     country:"India",        type:"airport", india:true },
  // Middle East
  DUBAI:         { lng:55.30,  lat:25.20,  name:"Dubai",         country:"UAE",          type:"both" },
  JEDDAH:        { lng:39.17,  lat:21.48,  name:"Jeddah",        country:"Saudi Arabia", type:"port" },
  MUSCAT:        { lng:58.59,  lat:23.61,  name:"Muscat",        country:"Oman",         type:"port" },
  // Asia
  SINGAPORE:     { lng:103.82, lat:1.29,   name:"Singapore",     country:"Singapore",    type:"both" },
  HONG_KONG:     { lng:114.16, lat:22.32,  name:"Hong Kong",     country:"China",        type:"both" },
  SHANGHAI:      { lng:121.47, lat:31.23,  name:"Shanghai",      country:"China",        type:"both" },
  SHENZHEN:      { lng:114.06, lat:22.54,  name:"Shenzhen",      country:"China",        type:"port" },
  TOKYO:         { lng:139.69, lat:35.68,  name:"Tokyo",         country:"Japan",        type:"both" },
  BUSAN:         { lng:129.05, lat:35.10,  name:"Busan",         country:"S.Korea",      type:"both" },
  BANGKOK:       { lng:100.52, lat:13.75,  name:"Bangkok",       country:"Thailand",     type:"both" },
  KUALA_LUMPUR:  { lng:101.70, lat:3.14,   name:"Kuala Lumpur",  country:"Malaysia",     type:"both" },
  PORT_KLANG:    { lng:101.40, lat:3.00,   name:"Port Klang",    country:"Malaysia",     type:"port" },
  JAKARTA:       { lng:106.84, lat:-6.21,  name:"Jakarta",       country:"Indonesia",    type:"both" },
  COLOMBO:       { lng:79.84,  lat:6.92,   name:"Colombo",       country:"Sri Lanka",    type:"port" },
  MANILA:        { lng:120.98, lat:14.60,  name:"Manila",        country:"Philippines",  type:"both" },
  // Europe
  LONDON:        { lng:-0.12,  lat:51.51,  name:"London",        country:"UK",           type:"both" },
  ROTTERDAM:     { lng:4.48,   lat:51.93,  name:"Rotterdam",     country:"Netherlands",  type:"port" },
  AMSTERDAM:     { lng:4.90,   lat:52.37,  name:"Amsterdam",     country:"Netherlands",  type:"airport" },
  HAMBURG:       { lng:9.99,   lat:53.55,  name:"Hamburg",       country:"Germany",      type:"port" },
  FRANKFURT:     { lng:8.68,   lat:50.11,  name:"Frankfurt",     country:"Germany",      type:"airport" },
  ANTWERP:       { lng:4.40,   lat:51.22,  name:"Antwerp",       country:"Belgium",      type:"port" },
  BARCELONA:     { lng:2.15,   lat:41.39,  name:"Barcelona",     country:"Spain",        type:"both" },
  PARIS:         { lng:2.35,   lat:48.86,  name:"Paris",         country:"France",       type:"airport" },
  ISTANBUL:      { lng:28.97,  lat:41.01,  name:"Istanbul",      country:"Turkey",       type:"both" },
  PIRAEUS:       { lng:23.64,  lat:37.94,  name:"Piraeus",       country:"Greece",       type:"port" },
  // Russia
  MOSCOW:        { lng:37.62,  lat:55.75,  name:"Moscow",        country:"Russia",       type:"airport" },
  ST_PETERSBURG: { lng:30.32,  lat:59.93,  name:"St.Petersburg", country:"Russia",       type:"both" },
  VLADIVOSTOK:   { lng:131.87, lat:43.12,  name:"Vladivostok",   country:"Russia",       type:"both" },
  // Americas
  NEW_YORK:      { lng:-74.01, lat:40.71,  name:"New York",      country:"USA",          type:"both" },
  LOS_ANGELES:   { lng:-118.24,lat:34.05,  name:"Los Angeles",   country:"USA",          type:"both" },
  CHICAGO:       { lng:-87.63, lat:41.88,  name:"Chicago",       country:"USA",          type:"airport" },
  MIAMI:         { lng:-80.19, lat:25.77,  name:"Miami",         country:"USA",          type:"both" },
  HOUSTON:       { lng:-95.37, lat:29.76,  name:"Houston",       country:"USA",          type:"both" },
  SEATTLE:       { lng:-122.33,lat:47.61,  name:"Seattle",       country:"USA",          type:"both" },
  SAO_PAULO:     { lng:-46.63, lat:-23.55, name:"São Paulo",     country:"Brazil",       type:"both" },
  BUENOS_AIRES:  { lng:-58.38, lat:-34.61, name:"Buenos Aires",  country:"Argentina",    type:"both" },
  // Africa
  NAIROBI:       { lng:36.82,  lat:-1.29,  name:"Nairobi",       country:"Kenya",        type:"both" },
  MOMBASA:       { lng:39.67,  lat:-4.06,  name:"Mombasa",       country:"Kenya",        type:"port" },
  LAGOS:         { lng:3.38,   lat:6.45,   name:"Lagos",         country:"Nigeria",      type:"both" },
  JOHANNESBURG:  { lng:28.05,  lat:-26.20, name:"Johannesburg",  country:"S.Africa",     type:"airport" },
  DURBAN:        { lng:31.03,  lat:-29.86, name:"Durban",        country:"S.Africa",     type:"port" },
  CAPE_TOWN:     { lng:18.42,  lat:-33.93, name:"Cape Town",     country:"S.Africa",     type:"both" },
  CAIRO:         { lng:31.23,  lat:30.04,  name:"Cairo",         country:"Egypt",        type:"both" },
  PORT_SAID:     { lng:32.27,  lat:31.26,  name:"Port Said",     country:"Egypt",        type:"port" },
  DJIBOUTI:      { lng:43.14,  lat:11.59,  name:"Djibouti",      country:"Djibouti",     type:"port" },
  DAR_ES_SALAAM: { lng:39.29,  lat:-6.79,  name:"Dar es Salaam", country:"Tanzania",     type:"port" },
  ACCRA:         { lng:-0.19,  lat:5.55,   name:"Accra",         country:"Ghana",        type:"both" },
  CASABLANCA:    { lng:-7.59,  lat:33.59,  name:"Casablanca",    country:"Morocco",      type:"both" },
  // Oceania
  SYDNEY:        { lng:151.21, lat:-33.87, name:"Sydney",        country:"Australia",    type:"both" },
  MELBOURNE:     { lng:144.96, lat:-37.81, name:"Melbourne",     country:"Australia",    type:"both" },
  AUCKLAND:      { lng:174.76, lat:-36.85, name:"Auckland",      country:"New Zealand",  type:"both" },
};

const REGION_MAP: Record<string, string> = {
  Russia:"russia", UK:"europe", Netherlands:"europe", Germany:"europe",
  France:"europe", Belgium:"europe", Spain:"europe", Italy:"europe",
  Greece:"europe", Turkey:"europe", Poland:"europe",
  USA:"usa", Canada:"usa", Mexico:"usa", Brazil:"usa", Argentina:"usa",
  Kenya:"africa", Nigeria:"africa", "S.Africa":"africa", Egypt:"africa",
  Tanzania:"africa", Djibouti:"africa", Ghana:"africa", Morocco:"africa",
  Singapore:"asia", China:"asia", Japan:"asia", "S.Korea":"asia",
  Thailand:"asia", Malaysia:"asia", Indonesia:"asia", Vietnam:"asia",
  Philippines:"asia", UAE:"asia", "Saudi Arabia":"asia",
};

const FILTER_CFG = {
  all:    { label:"All Routes", icon:"🌐", color:"#e2e8f0" },
  russia: { label:"Russia",     icon:"🇷🇺", color:"#e879f9" },
  europe: { label:"Europe",     icon:"🇪🇺", color:"#38bdf8" },
  usa:    { label:"Americas",   icon:"🌎",  color:"#fb923c" },
  africa: { label:"Africa",     icon:"🌍",  color:"#34d399" },
  asia:   { label:"Asia",       icon:"🌏",  color:"#a78bfa" },
} as const;
type FilterMode = keyof typeof FILTER_CFG;

// ─────────────────────────────────────────────────────────────────────────────
// Projection — bounded Mercator matched to the map PNG's actual lat range
// Image spans approx -56.5°S (bottom) to +83.65°N (top)
// X offset of -18px corrects for the silhouette map's right-side margin bias
// ─────────────────────────────────────────────────────────────────────────────
const VW = 1000, VH = 500;
const MAP_LAT_MAX = 83.65, MAP_LAT_MIN = -56.50;
const X_OFFSET = -18; // shifts all points ~18px left to align with PNG landmasses

function mercY(latDeg: number): number {
  const r = (latDeg * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + r / 2));
}
const _yMax = mercY(MAP_LAT_MAX);
const _yMin = mercY(MAP_LAT_MIN);

function project(lng: number, lat: number): [number, number] {
  const x = ((lng + 180) / 360) * VW + X_OFFSET;
  const y = (_yMax - mercY(lat)) / (_yMax - _yMin) * VH;
  return [parseFloat(x.toFixed(2)), parseFloat(y.toFixed(2))];
}

function arcCtrl(x1:number,y1:number,x2:number,y2:number,lift=-0.28):[number,number]{
  const mx=(x1+x2)/2, my=(y1+y2)/2, dx=x2-x1, dy=y2-y1;
  const len=Math.sqrt(dx*dx+dy*dy)||1, px=-dy/len, py=dx/len, d=len*Math.abs(lift);
  return [mx+px*d*Math.sign(lift), my+py*d*Math.sign(lift)];
}
function bezPt(x1:number,y1:number,cx:number,cy:number,x2:number,y2:number,t:number){
  const m=1-t;
  return {x:m*m*x1+2*m*t*cx+t*t*x2, y:m*m*y1+2*m*t*cy+t*t*y2};
}
function routeColor(r: ShipmentRoute): string {
  if (r.color) return r.color;
  const reg = REGION_MAP[PORT_DB[r.toPort]?.country ?? ""];
  if (reg==="russia") return "#e879f9";
  if (reg==="europe") return "#38bdf8";
  if (reg==="usa")    return "#fb923c";
  if (reg==="africa") return "#34d399";
  if (reg==="asia")   return "#a78bfa";
  return r.type==="air" ? "#818cf8" : "#67e8f9";
}

// 7 real high-volume India trade corridors (2024 data)
const DEMO_ROUTES: ShipmentRoute[] = [
  { id:"r1", fromPort:"NHAVA_SHEVA", toPort:"NEW_YORK",    type:"ocean", status:"active", cargo:"Pharmaceuticals & Textiles",    vessel:"Maersk Sentosa"    },
  { id:"r2", fromPort:"MUMBAI",      toPort:"DUBAI",       type:"air",   status:"active", cargo:"Gems, Jewellery & Gold",        vessel:"Air India Cargo"   },
  { id:"r3", fromPort:"NHAVA_SHEVA", toPort:"ROTTERDAM",   type:"ocean", status:"active", cargo:"Chemicals & Machinery",         vessel:"MSC Gulsun"        },
  { id:"r4", fromPort:"KOLKATA",     toPort:"SHANGHAI",    type:"ocean", status:"active", cargo:"Cotton & Iron Ore",             vessel:"COSCO Shipping"    },
  { id:"r5", fromPort:"DELHI",       toPort:"LOS_ANGELES", type:"air",   status:"active", cargo:"Electronics & Auto Parts",      vessel:"IndiGo Cargo"      },
  { id:"r6", fromPort:"COCHIN",      toPort:"MOMBASA",     type:"ocean", status:"active", cargo:"Rice, Sugar & Pharma",          vessel:"X-Press Karimata"  },
  { id:"r7", fromPort:"CHENNAI",     toPort:"SINGAPORE",   type:"ocean", status:"active", cargo:"Refined Petroleum & Machinery", vessel:"PIL Singapore"     },
];

// ─────────────────────────────────────────────────────────────────────────────
// Embedded Map
// ─────────────────────────────────────────────────────────────────────────────
interface MapProps {
  filter: FilterMode; apiRoutes: ShipmentRoute[]; isDemo: boolean;
}
const EmbeddedMap = memo(function EmbeddedMap({ filter, apiRoutes, isDemo }: MapProps) {
  const [packets, setPackets] = useState<{id:number;routeId:string;t:number;speed:number}[]>([]);
  const [hovPort,  setHovPort]  = useState<string|null>(null);
  const [hovRoute, setHovRoute] = useState<string|null>(null);
  const animRef  = useRef<number>(0);
  const lastTRef = useRef<number>(0);
  const pidRef   = useRef(0);

  const portXY = useMemo(()=>
    Object.fromEntries(Object.entries(PORT_DB).map(([k,p])=>[k,project(p.lng,p.lat)])) as Record<string,[number,number]>
  ,[]);

  const activeRoutes = useMemo(()=>{
    const base = isDemo ? DEMO_ROUTES : apiRoutes.filter(r=>r.status==="active");
    if (filter==="all") return base;
    return base.filter(r=>{
      const dc=PORT_DB[r.toPort]?.country??"", sc=PORT_DB[r.fromPort]?.country??"";
      return REGION_MAP[dc]===filter||REGION_MAP[sc]===filter;
    });
  },[isDemo,apiRoutes,filter]);

  const activePorts = useMemo(()=>{
    const s=new Set<string>(); activeRoutes.forEach(r=>{s.add(r.fromPort);s.add(r.toPort)}); return s;
  },[activeRoutes]);

  useEffect(()=>{
    setPackets(prev=>{
      const activeIds=new Set(activeRoutes.map(r=>r.id));
      const kept=prev.filter(p=>activeIds.has(p.routeId));
      const existing=new Set(kept.map(p=>p.routeId));
      const newP: typeof packets=[];
      for(const r of activeRoutes){
        if(!existing.has(r.id)){
          if(r.progress!==undefined) newP.push({id:pidRef.current++,routeId:r.id,t:r.progress,speed:0});
          else for(let j=0;j<3;j++) newP.push({id:pidRef.current++,routeId:r.id,t:j/3,speed:0.0004+Math.random()*0.0006});
        }
      }
      return [...kept,...newP];
    });
  },[activeRoutes]);

  const animate=useCallback((time:number)=>{
    const dt=Math.min(time-lastTRef.current,50); lastTRef.current=time;
    setPackets(prev=>prev.map(p=>p.speed===0?p:{...p,t:(p.t+p.speed*dt)%1}));
    animRef.current=requestAnimationFrame(animate);
  },[]);
  useEffect(()=>{ animRef.current=requestAnimationFrame(animate); return()=>cancelAnimationFrame(animRef.current); },[animate]);

  const IC="#fbbf24";
  return(
    <div className="absolute inset-0">
      <img src="/world-map-flat.png" alt="" className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
        style={{opacity:0.20,mixBlendMode:"luminosity",filter:"hue-rotate(200deg) brightness(0.55) saturate(0.35)"}}/>
      <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 130% 80% at 50% 55%,rgba(3,12,30,0.2) 0%,rgba(2,6,14,0.65) 100%)"}}/>
      {/* India ambient glow — adjusted x position */}
      <div className="absolute pointer-events-none" style={{left:"68%",top:"60%",width:260,height:190,transform:"translate(-50%,-50%)",background:"radial-gradient(ellipse,rgba(251,191,36,0.09) 0%,transparent 70%)"}}/>
      <div className="absolute inset-0 pointer-events-none opacity-[0.012]" style={{backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,200,255,0.5) 2px,rgba(0,200,255,0.5) 3px)"}}/>

      <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 w-full h-full" style={{display:"block"}} preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="em-glow-fat" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="em-glow-med" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="em-hub" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="em-india" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" result="b"/>
            <feColorMatrix in="b" type="matrix" values="0 0 0 0 0.98 0 0 0 0 0.75 0 0 0 0 0.14 0 0 0 1.5 0" result="cb"/>
            <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="em-pkt" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          {[["gold","#fbbf24"],["fuchsia","#e879f9"],["sky","#38bdf8"],["orange","#fb923c"],["emerald","#34d399"],["violet","#a78bfa"],["indigo","#818cf8"],["cyan","#67e8f9"]].map(([id,clr])=>(
            <radialGradient key={id} id={`em-rg-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
              <stop offset="30%" stopColor={clr} stopOpacity="0.95"/>
              <stop offset="100%" stopColor={clr} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>

        {[-60,-30,0,30,60].map(lat=>{const[,y]=project(0,lat);return<line key={lat} x1={0} y1={y} x2={VW} y2={y} stroke="#0d2540" strokeWidth={lat===0?0.8:0.4} strokeOpacity={lat===0?0.5:0.18} strokeDasharray={lat===0?"none":"8,6"}/>})}
        {[-150,-120,-90,-60,-30,0,30,60,90,120,150].map(lng=>{const[x]=project(lng,0);return<line key={lng} x1={x} y1={0} x2={x} y2={VH} stroke="#0d2540" strokeWidth="0.35" strokeOpacity="0.18" strokeDasharray="8,6"/>})}

        {/* Dormant dots */}
        {Object.entries(portXY).map(([key,[px,py]])=>{
          const port=PORT_DB[key]; if(activePorts.has(key)||port.india) return null;
          return<circle key={key} cx={px} cy={py} r={1.3} fill="#1e3a5f" opacity={0.3} style={{cursor:"pointer"}} onMouseEnter={()=>setHovPort(key)} onMouseLeave={()=>setHovPort(null)}/>;
        })}

        {/* Routes */}
        {activeRoutes.map(r=>{
          const p1=portXY[r.fromPort],p2=portXY[r.toPort]; if(!p1||!p2) return null;
          const lift=r.type==="ocean"?-0.10:-0.28; const[cx,cy]=arcCtrl(p1[0],p1[1],p2[0],p2[1],lift);
          const clr=routeColor(r); const hov=hovRoute===r.id;
          return<path key={`fat-${r.id}`} d={`M${p1[0]},${p1[1]} Q${cx},${cy} ${p2[0]},${p2[1]}`} fill="none" stroke={clr} strokeWidth={hov?16:9} strokeOpacity={hov?0.35:0.13} filter="url(#em-glow-fat)" strokeLinecap="round"/>;
        })}
        {activeRoutes.map(r=>{
          const p1=portXY[r.fromPort],p2=portXY[r.toPort]; if(!p1||!p2) return null;
          const lift=r.type==="ocean"?-0.10:-0.28; const[cx,cy]=arcCtrl(p1[0],p1[1],p2[0],p2[1],lift);
          const clr=routeColor(r); const hov=hovRoute===r.id;
          return<path key={`mid-${r.id}`} d={`M${p1[0]},${p1[1]} Q${cx},${cy} ${p2[0]},${p2[1]}`} fill="none" stroke={clr} strokeWidth={hov?3:1.6} strokeOpacity={hov?0.7:0.30} filter="url(#em-glow-med)" strokeLinecap="round" strokeDasharray={r.type==="ocean"?"6,3":"none"}/>;
        })}
        {activeRoutes.map(r=>{
          const p1=portXY[r.fromPort],p2=portXY[r.toPort]; if(!p1||!p2) return null;
          const lift=r.type==="ocean"?-0.10:-0.28; const[cx,cy]=arcCtrl(p1[0],p1[1],p2[0],p2[1],lift);
          const clr=routeColor(r); const hov=hovRoute===r.id;
          return<path key={`crisp-${r.id}`} d={`M${p1[0]},${p1[1]} Q${cx},${cy} ${p2[0]},${p2[1]}`} fill="none" stroke={clr} strokeWidth={hov?2:1} strokeOpacity={hov?1:0.55} strokeLinecap="round" strokeDasharray={r.type==="ocean"?"5,3":"none"} style={{cursor:"pointer"}} onMouseEnter={()=>setHovRoute(r.id)} onMouseLeave={()=>setHovRoute(null)}/>;
        })}

        {/* Packets */}
        {packets.map(pkt=>{
          const route=activeRoutes.find(r=>r.id===pkt.routeId); if(!route) return null;
          const p1=portXY[route.fromPort],p2=portXY[route.toPort]; if(!p1||!p2) return null;
          const lift=route.type==="ocean"?-0.10:-0.28; const[cx,cy]=arcCtrl(p1[0],p1[1],p2[0],p2[1],lift);
          const pt=bezPt(p1[0],p1[1],cx,cy,p2[0],p2[1],pkt.t);
          const clr=routeColor(route);
          let rgId="indigo";
          if(clr==="#fbbf24")rgId="gold"; else if(clr==="#e879f9")rgId="fuchsia"; else if(clr==="#38bdf8")rgId="sky"; else if(clr==="#fb923c")rgId="orange"; else if(clr==="#34d399")rgId="emerald"; else if(clr==="#a78bfa")rgId="violet"; else if(clr==="#67e8f9")rgId="cyan";
          const trail=[0.03,0.07,0.12].map(off=>bezPt(p1[0],p1[1],cx,cy,p2[0],p2[1],Math.max(0,pkt.t-off)));
          return(
            <g key={pkt.id} filter="url(#em-pkt)">
              {trail.map((tp,ti)=><circle key={ti} cx={tp.x} cy={tp.y} r={2.4-ti*0.65} fill={clr} opacity={0.38-ti*0.1}/>)}
              <circle cx={pt.x} cy={pt.y} r={4.2} fill={`url(#em-rg-${rgId})`} opacity={0.97}/>
            </g>
          );
        })}

        {/* Port nodes */}
        {[...activePorts].map(key=>{
          const port=PORT_DB[key]; if(!port) return null;
          const[px,py]=portXY[key]; const isIndia=!!port.india; const isHov=hovPort===key;
          const clr=isIndia?IC:isHov?"#fff":"#60a5fa";
          return(
            <g key={key} style={{cursor:"pointer"}} onMouseEnter={()=>setHovPort(key)} onMouseLeave={()=>setHovPort(null)}>
              <circle cx={px} cy={py} r={isIndia?22:14} fill="transparent"/>
              <circle cx={px} cy={py} r={isIndia?14:9} fill="none" stroke={clr} strokeWidth={isIndia?"1.5":"1"} strokeOpacity={isIndia?0.7:0.4} filter={isIndia?"url(#em-india)":"url(#em-hub)"}>
                <animate attributeName="r" values={`${isIndia?10:6};${isIndia?22:16};${isIndia?10:6}`} dur={`${isIndia?1.8:2.6}s`} repeatCount="indefinite"/>
                <animate attributeName="stroke-opacity" values="0.7;0;0.7" dur={`${isIndia?1.8:2.6}s`} repeatCount="indefinite"/>
              </circle>
              {isIndia&&<circle cx={px} cy={py} r={8} fill="none" stroke={IC} strokeWidth="1.2" strokeOpacity="0.6" filter="url(#em-india)"/>}
              <circle cx={px} cy={py} r={isIndia?6:3.5} fill={clr} filter={isIndia?"url(#em-india)":"url(#em-hub)"} opacity={0.95}/>
              <circle cx={px} cy={py} r={isIndia?2.8:1.8} fill="#fff"/>
              {(isIndia||isHov)&&(
                <text x={px} y={py-(isIndia?18:13)} textAnchor="middle" fontSize={isIndia?"9.5":"8"} fill={isIndia?IC:"#e2e8f0"} fontFamily="monospace" fontWeight={isIndia?"bold":"normal"} letterSpacing="0.8" style={{pointerEvents:"none"}}>{port.name.toUpperCase()}</text>
              )}
            </g>
          );
        })}

        {/* Port tooltip */}
        {hovPort&&(()=>{
          const port=PORT_DB[hovPort]; if(!port) return null;
          const[px,py]=portXY[hovPort];
          const bx=Math.min(Math.max(px,85),VW-85); const by=py>360?py-74:py+20;
          const clr=port.india?IC:"#60a5fa";
          const rc=activeRoutes.filter(r=>r.fromPort===hovPort||r.toPort===hovPort).length;
          return(<g style={{pointerEvents:"none"}}>
            <rect x={bx-75} y={by} width={150} height={60} rx={6} fill="#04080f" stroke={clr} strokeWidth="0.9" strokeOpacity="0.8" style={{filter:`drop-shadow(0 0 12px ${clr}55)`}}/>
            <text x={bx} y={by+17} textAnchor="middle" fontSize="9" fill={clr} fontFamily="monospace" fontWeight="bold">{port.name.toUpperCase()}</text>
            <text x={bx} y={by+30} textAnchor="middle" fontSize="7.5" fill="#64748b" fontFamily="monospace">{port.country} · {port.type==="both"?"Port & Airport":port.type==="port"?"Seaport":"Airport"}</text>
            <text x={bx} y={by+44} textAnchor="middle" fontSize="7.5" fill="#94a3b8" fontFamily="monospace">{rc>0?`${rc} active corridor${rc!==1?"s":""}`:`${port.lng.toFixed(1)}°  ${port.lat.toFixed(1)}°`}</text>
          </g>);
        })()}

        {/* Route tooltip */}
        {hovRoute&&(()=>{
          const r=activeRoutes.find(x=>x.id===hovRoute); if(!r) return null;
          const fp=PORT_DB[r.fromPort],tp=PORT_DB[r.toPort]; if(!fp||!tp) return null;
          const[x1,y1]=portXY[r.fromPort],[x2,y2]=portXY[r.toPort];
          const bx=Math.min(Math.max((x1+x2)/2,90),VW-90);
          const lift=r.type==="ocean"?-0.10:-0.28; const[,cy]=arcCtrl(x1,y1,x2,y2,lift);
          const by=Math.min(Math.max(cy-40,4),VH-80); const clr=routeColor(r);
          return(<g style={{pointerEvents:"none"}}>
            <rect x={bx-90} y={by} width={180} height={62} rx={6} fill="#04080f" stroke={clr} strokeWidth="0.9" strokeOpacity="0.8" style={{filter:`drop-shadow(0 0 12px ${clr}55)`}}/>
            <text x={bx} y={by+16} textAnchor="middle" fontSize="8.5" fill={clr} fontFamily="monospace" fontWeight="bold">{fp.name.toUpperCase()} → {tp.name.toUpperCase()}</text>
            <text x={bx} y={by+30} textAnchor="middle" fontSize="7.5" fill="#64748b" fontFamily="monospace">{r.type==="air"?"✈ Air":r.type==="ocean"?"⚓ Ocean":"🚛 Land"}{r.vessel?` · ${r.vessel}`:""}</text>
            <text x={bx} y={by+44} textAnchor="middle" fontSize="7.5" fill="#94a3b8" fontFamily="monospace">{r.cargo?`${r.cargo}`:`Status: ${r.status}`}</text>
          </g>);
        })()}
      </svg>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Page constants
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string,{color:string;shadow:string}> = {
  ELECTRONICS:  {color:"bg-blue-500",   shadow:"shadow-[0_0_8px_rgba(59,130,246,0.5)]"},
  MACHINES:     {color:"bg-teal-500",   shadow:"shadow-[0_0_8px_rgba(20,184,166,0.5)]"},
  CHEMICALS:    {color:"bg-purple-500", shadow:"shadow-[0_0_8px_rgba(168,85,247,0.5)]"},
  TEXTILES:     {color:"bg-orange-500", shadow:"shadow-[0_0_8px_rgba(249,115,22,0.5)]"},
  MEDICAL:      {color:"bg-rose-500",   shadow:"shadow-[0_0_8px_rgba(244,63,94,0.5)]"},
  HANDICRAFTS:  {color:"bg-amber-500",  shadow:"shadow-[0_0_8px_rgba(245,158,11,0.5)]"},
  FOOD:         {color:"bg-green-500",  shadow:"shadow-[0_0_8px_rgba(34,197,94,0.5)]"},
  AUTOMOTIVE:   {color:"bg-slate-500",  shadow:"shadow-[0_0_8px_rgba(100,116,139,0.5)]"},
  CONSTRUCTION: {color:"bg-yellow-600", shadow:"shadow-[0_0_8px_rgba(202,138,4,0.5)]"},
  AGRICULTURE:  {color:"bg-lime-500",   shadow:"shadow-[0_0_8px_rgba(132,204,22,0.5)]"},
  OTHER:        {color:"bg-gray-500",   shadow:"shadow-[0_0_8px_rgba(107,114,128,0.5)]"},
};
const STATUS_COLORS: Record<string,string> = {
  PENDING:"text-yellow-400", CONFIRMED:"text-blue-400", PROCESSING:"text-yellow-400",
  SHIPPED:"text-green-400",  DELIVERED:"text-green-400", CANCELLED:"text-red-400", DISPUTED:"text-red-400",
};
const STATUS_BG: Record<string,string> = {
  PENDING:"bg-yellow-500/10 border-yellow-500/30", CONFIRMED:"bg-blue-500/10 border-blue-500/30",
  PROCESSING:"bg-yellow-500/10 border-yellow-500/30", SHIPPED:"bg-green-500/10 border-green-500/30",
  DELIVERED:"bg-green-500/10 border-green-500/30", CANCELLED:"bg-red-500/10 border-red-500/30",
  DISPUTED:"bg-red-500/10 border-red-500/30",
};
const BG_COLORS=[
  {bg:"bg-amber-500/20", text:"text-amber-400"},{bg:"bg-blue-500/20",   text:"text-blue-400"},
  {bg:"bg-slate-500/20", text:"text-slate-400"},{bg:"bg-purple-500/20", text:"text-purple-400"},
  {bg:"bg-green-500/20", text:"text-green-400"},{bg:"bg-cyan-500/20",   text:"text-cyan-400"},
];
function fmtVal(n:number,pre="",suf=""){
  if(n>=1_000_000) return `${pre}${(n/1_000_000).toFixed(1)}M${suf}`;
  if(n>=1_000)     return `${pre}${(n/1_000).toFixed(0)}K${suf}`;
  return `${pre}${n}${suf}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ExporterDashboard() {
  const router = useRouter();

  // Data
  const [data,         setData]         = useState<ExporterStats|null>(null);
  const [allOrders,    setAllOrders]    = useState<OrderItem[]>([]);
  const [categories,   setCategories]   = useState<CategoryRevenue[]>([]);
  const [partners,     setPartners]     = useState<Partner[]>([]);
  const [loading,      setLoading]      = useState(true);

  // Map
  const [apiRoutes,   setApiRoutes]  = useState<ShipmentRoute[]>([]);
  const [mapIsDemo,   setMapIsDemo]  = useState(false);
  const [mapLoading,  setMapLoading] = useState(true);
  const [mapFilter,   setMapFilter]  = useState<FilterMode>("all");
  const [lastUpdate,  setLastUpdate] = useState<Date|null>(null);
  const [mapRefresh,  setMapRefresh] = useState(0);
  const [activeCount, setActiveCount]= useState(0);

  // Search & filter
  const [search,         setSearch]         = useState("");
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [period,         setPeriod]         = useState<PeriodFilter>("all");
  const [periodOpen,     setPeriodOpen]     = useState(false);

  // Calendar
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calMonth,     setCalMonth]     = useState(new Date());

  // Load dashboard data with period filter
  useEffect(()=>{
    setLoading(true);
    const params = period !== "all" ? `?period=${period}` : "";
    Promise.all([
      authFetch<ExporterStats>(`/api/stats?scope=exporter${params ? "&"+params.slice(1) : ""}`).catch(()=>null),
      authFetch<{orders:OrderItem[]}>(`/api/orders?limit=20${params ? "&"+params.slice(1) : ""}`).catch(()=>({orders:[]})),
      authFetch<{revenueByCategory:CategoryRevenue[]}>(`/api/dashboard/analytics${params}`).catch(()=>({revenueByCategory:[]})),
      authFetch<{partners:Partner[]}>("/api/dashboard/directory").catch(()=>({partners:[]})),
    ]).then(([s,o,a,d])=>{
      setData(s); setAllOrders(o.orders||[]); setCategories(a.revenueByCategory||[]);
      setPartners((d.partners||[]).slice(0,3)); setLoading(false);
    });
  },[period]);

  // Load live routes
  useEffect(()=>{
    setMapLoading(true);
    fetch("/api/shipments/active",{credentials:"include"})
      .then(r=>r.ok?r.json():Promise.reject(r.status))
      .then((d:{routes:ShipmentRoute[];total:number})=>{ setApiRoutes(d.routes); setMapIsDemo(false); setActiveCount(d.total); setLastUpdate(new Date()); })
      .catch(()=>{ setMapIsDemo(true); setActiveCount(DEMO_ROUTES.length); })
      .finally(()=>setMapLoading(false));
  },[mapRefresh]);

  useEffect(()=>{ const t=setInterval(()=>setMapRefresh(n=>n+1),15000); return()=>clearInterval(t); },[]);

  // ── Search filtering ────────────────────────────────────────────────────────
  const filteredOrders = useMemo(()=>{
    if(!search.trim()) return allOrders.slice(0,4);
    const q = search.toLowerCase();
    return allOrders.filter(o=>
      o.product.name.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      (o.importer.companyName||o.importer.name).toLowerCase().includes(q) ||
      (o.importer.country||"").toLowerCase().includes(q)
    ).slice(0,8);
  },[search, allOrders]);

  const filteredPartners = useMemo(()=>{
    if(!search.trim()) return partners;
    const q=search.toLowerCase();
    return partners.filter(p=>
      (p.companyName||p.name).toLowerCase().includes(q)||
      (p.country||"").toLowerCase().includes(q)
    );
  },[search,partners]);

  const maxCatRevenue = Math.max(...categories.map(c=>c.revenue),1);

  const regionCounts = useMemo(()=>{
    const base=mapIsDemo?DEMO_ROUTES:apiRoutes;
    return Object.fromEntries((["russia","europe","usa","africa","asia"] as FilterMode[]).map(m=>[
      m, base.filter(r=>{const dc=PORT_DB[r.toPort]?.country??"",sc=PORT_DB[r.fromPort]?.country??""; return REGION_MAP[dc]===m||REGION_MAP[sc]===m;}).length
    ])) as Record<string,number>;
  },[mapIsDemo,apiRoutes]);

  // Calendar helpers
  const getDaysInMonth = (d:Date) => new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
  const getFirstDayOfMonth = (d:Date) => new Date(d.getFullYear(),d.getMonth(),1).getDay();
  const calDays = useMemo(()=>{
    const days=[]; const firstDay=getFirstDayOfMonth(calMonth); const total=getDaysInMonth(calMonth);
    for(let i=0;i<firstDay;i++) days.push(null);
    for(let i=1;i<=total;i++) days.push(i);
    return days;
  },[calMonth]);

  // KPI card data
  const statCards = [
    {
      label:"Total Products", value:loading?"—":String(data?.totalProducts??0),
      sub: period==="all"?"All products":"In period",
      icon:<Package className="w-5 h-5"/>, href:"/dashboard/exporter/products",
      gradFrom:"from-blue-600", gradTo:"to-primary",
      bgTint:"bg-blue-500/10", textTint:"text-blue-400",
      borderTint:"border-blue-500/20", glowColor:"rgba(37,99,235,0.4)",
      shadow:"shadow-[0_0_20px_rgba(37,99,235,0.3)]",
      bar:Math.min(((data?.totalProducts??0)/50)*100,100)||75,
      trendUp:true as boolean|null, trend:"Live",
    },
    {
      label:"Total Revenue", value:loading?"—":fmtVal(data?.totalRevenue??0,"$"),
      sub: PERIOD_LABELS[period],
      icon:<DollarSign className="w-5 h-5"/>, href:"/dashboard/exporter/analytics",
      gradFrom:"from-purple-600", gradTo:"to-[#bc13ec]",
      bgTint:"bg-[#bc13ec]/10", textTint:"text-[#bc13ec]",
      borderTint:"border-[#bc13ec]/20", glowColor:"rgba(188,19,236,0.4)",
      shadow:"shadow-[0_0_20px_rgba(188,19,236,0.3)]",
      bar:60, trendUp:true as boolean|null, trend:"+12.5%",
    },
    {
      label:"Active Orders", value:loading?"—":String(data?.activeOrders??0),
      sub:"In progress",
      icon:<ShoppingCart className="w-5 h-5"/>, href:"/dashboard/exporter/orders",
      gradFrom:"from-green-600", gradTo:"to-[#00ff9d]",
      bgTint:"bg-[#00ff9d]/10", textTint:"text-[#00ff9d]",
      borderTint:"border-[#00ff9d]/20", glowColor:"rgba(0,255,157,0.4)",
      shadow:"shadow-[0_0_20px_rgba(0,255,157,0.3)]",
      bar:Math.min(((data?.activeOrders??0)/20)*100,100)||85,
      trendUp:true as boolean|null, trend:"Active",
    },
    {
      label:"Total Shipments", value:loading?"—":String(data?.totalShipments??0),
      sub:PERIOD_LABELS[period],
      icon:<Truck className="w-5 h-5"/>, href:"/dashboard/exporter/shipments",
      gradFrom:"from-orange-600", gradTo:"to-orange-400",
      bgTint:"bg-orange-500/10", textTint:"text-orange-500",
      borderTint:"border-orange-500/20", glowColor:"rgba(249,115,22,0.4)",
      shadow:"shadow-[0_0_20px_rgba(249,115,22,0.3)]",
      bar:30, trendUp:null as boolean|null, trend:"All time",
    },
  ];

  return(
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0c12] to-[#0a0c12] relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:"linear-gradient(to right,#1f2937 1px,transparent 1px),linear-gradient(to bottom,#1f2937 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>

      {/* ── Header ── */}
      <header className="flex-shrink-0 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0a0c12]/40 backdrop-blur-md z-40">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Executive Overview
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"/>Live
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Welcome back, Director</p>
        </div>

        <div className="flex items-center gap-3">
          {/* System status */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#151c2a]/60 border border-white/8 text-sm text-slate-400 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            System Operational
          </div>

          {/* Period filter dropdown */}
          <div className="relative">
            <button
              onClick={()=>setPeriodOpen(o=>!o)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${periodOpen?"bg-primary/15 border-primary/40 text-primary":"bg-[#151c2a]/60 border-white/8 text-slate-400 hover:border-white/20 hover:text-white"}`}>
              <Filter className="w-3.5 h-3.5"/>
              <span className="hidden sm:inline">{PERIOD_LABELS[period]}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${periodOpen?"rotate-180":""}`}/>
            </button>
            {periodOpen&&(
              <div className="absolute right-0 top-12 w-44 bg-[#0f1521] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                {(Object.entries(PERIOD_LABELS) as [PeriodFilter,string][]).map(([k,v])=>(
                  <button key={k} onClick={()=>{setPeriod(k);setPeriodOpen(false);}}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${period===k?"bg-primary/15 text-primary":"text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              onFocus={()=>setSearchFocused(true)} onBlur={()=>setTimeout(()=>setSearchFocused(false),200)}
              className={`pl-10 pr-8 py-2.5 bg-[#151c2a]/60 border rounded-xl text-sm text-white placeholder-slate-500 w-56 transition-all duration-300 outline-none ${searchFocused?"border-primary/50 shadow-[0_0_0_3px_rgba(19,91,236,0.15)] w-72":"border-white/8 hover:border-white/15"}`}
              placeholder="Search orders, products..."
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"/>
            {search&&<button onClick={()=>setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5"/></button>}
            {/* Search results dropdown */}
            {searchFocused&&search.trim()&&(
              <div className="absolute top-12 left-0 w-80 bg-[#0f1521] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                {filteredOrders.length===0?(
                  <p className="text-center text-slate-500 text-sm py-6">No results for "{search}"</p>
                ):(
                  <>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider px-4 pt-3 pb-1 font-semibold">Orders</p>
                    {filteredOrders.slice(0,5).map((o,idx)=>(
                      <Link key={o.id} href={`/dashboard/exporter/orders/${o.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors">
                        <div className={`w-8 h-8 rounded-lg ${BG_COLORS[idx%BG_COLORS.length].bg} ${BG_COLORS[idx%BG_COLORS.length].text} flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                          {getInitials(o.product.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{o.product.name}</p>
                          <p className="text-[10px] text-slate-500">{o.orderNumber} · {formatCurrency(o.totalPrice)}</p>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ml-auto flex-shrink-0 ${STATUS_BG[o.status]||""} ${STATUS_COLORS[o.status]||""}`}>{o.status}</span>
                      </Link>
                    ))}
                    {filteredOrders.length>5&&<p className="text-center text-primary text-xs py-2 hover:underline cursor-pointer" onClick={()=>router.push(`/dashboard/exporter/orders?q=${search}`)}>View all {filteredOrders.length} results</p>}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="relative">
            <button
              onClick={()=>setCalendarOpen(o=>!o)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all duration-200 ${calendarOpen?"bg-primary/15 border-primary/40 text-primary":"bg-[#151c2a]/60 border-white/8 hover:bg-white/8 hover:border-white/20 text-slate-400 hover:text-white"}`}>
              <CalendarDays className="w-5 h-5"/>
            </button>
            {calendarOpen&&(
              <div className="absolute right-0 top-12 w-72 bg-[#0f1521] border border-white/10 rounded-2xl shadow-2xl z-50 p-4">
                {/* Calendar header */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">‹</button>
                  <span className="text-sm font-semibold text-white">{calMonth.toLocaleString("default",{month:"long",year:"numeric"})}</span>
                  <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">›</button>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
                    <div key={d} className="text-center text-[10px] text-slate-500 font-semibold py-1">{d}</div>
                  ))}
                </div>
                {/* Days grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calDays.map((day,i)=>{
                    if(!day) return <div key={i}/>;
                    const isSelected = day===selectedDate.getDate()&&calMonth.getMonth()===selectedDate.getMonth()&&calMonth.getFullYear()===selectedDate.getFullYear();
                    const isToday    = day===new Date().getDate()&&calMonth.getMonth()===new Date().getMonth()&&calMonth.getFullYear()===new Date().getFullYear();
                    return(
                      <button key={i} onClick={()=>{setSelectedDate(new Date(calMonth.getFullYear(),calMonth.getMonth(),day));setCalendarOpen(false);}}
                        className={`w-full aspect-square flex items-center justify-center text-xs rounded-lg transition-all duration-150 font-medium
                          ${isSelected?"bg-primary text-white shadow-lg shadow-primary/30":isToday?"bg-primary/15 text-primary border border-primary/30":"text-slate-400 hover:bg-white/8 hover:text-white"}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {selectedDate.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  </span>
                  <button onClick={()=>{setSelectedDate(new Date());setCalMonth(new Date());setCalendarOpen(false);}}
                    className="text-[11px] text-primary hover:underline">Today</button>
                </div>
              </div>
            )}
          </div>

          {/* New Product */}
          <Link href="/dashboard/exporter/inventory?action=add"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-[#1a6ef5] text-white text-sm font-semibold shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0">
            <Plus className="w-4 h-4"/>
            <span className="hidden sm:inline">New Product</span>
          </Link>
        </div>
      </header>

      {/* ── Click outside to close dropdowns ── */}
      {(periodOpen||calendarOpen)&&(
        <div className="fixed inset-0 z-40" onClick={()=>{setPeriodOpen(false);setCalendarOpen(false);}}/>
      )}

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1920px] mx-auto space-y-6">

          {/* ── Period filter indicator ── */}
          {period!=="all"&&(
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/8 border border-primary/20 rounded-xl w-fit">
              <Filter className="w-3.5 h-3.5 text-primary"/>
              <span className="text-sm text-primary font-medium">Showing: {PERIOD_LABELS[period]}</span>
              <button onClick={()=>setPeriod("all")} className="ml-2 text-slate-400 hover:text-white transition-colors"><X className="w-3.5 h-3.5"/></button>
            </div>
          )}

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {statCards.map((s)=>(
              <Link key={s.label} href={s.href}
                className={`bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 cursor-pointer block`}
                style={{boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow=s.shadow;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow="0 4px 24px rgba(0,0,0,0.4)";}}
              >
                {/* Background glow blob */}
                <div className={`absolute -right-8 -top-8 w-32 h-32 ${s.bgTint} rounded-full blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-80`}/>
                <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500" style={{background:`radial-gradient(circle, ${s.glowColor}, transparent)`}}/>

                {/* Top row */}
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className={`p-3 rounded-xl ${s.bgTint} ${s.textTint} border ${s.borderTint} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    {s.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg border ${s.trendUp===true?"text-green-400 bg-green-500/10 border-green-500/20":s.trendUp===false?"text-red-400 bg-red-500/10 border-red-500/20":"text-slate-400 bg-white/5 border-white/10"}`}>
                      {s.trendUp===true  &&<TrendingUp className="w-3 h-3 mr-1"/>}
                      {s.trendUp===false &&<AlertTriangle className="w-3 h-3 mr-1"/>}
                      {s.trend}
                    </span>
                  </div>
                </div>

                {/* Value */}
                <div className="relative z-10">
                  <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">{s.label}</p>
                  <div className="flex items-end gap-2">
                    <p className={`text-3xl font-bold text-white tracking-tight group-hover:${s.textTint} transition-colors duration-200`}>{s.value}</p>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">{s.sub}</p>
                </div>

                {/* Bar */}
                <div className="mt-4 relative z-10">
                  <div className="h-1.5 w-full bg-[#0d1117] rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${s.gradFrom} ${s.gradTo} rounded-full transition-all duration-700`}
                      style={{width:`${Math.min(s.bar,100)}%`,boxShadow:`0 0 10px ${s.glowColor}`}}/>
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                  <ChevronRight className={`w-4 h-4 ${s.textTint}`}/>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Map + Transactions ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5" style={{height:"520px"}}>

            {/* Map */}
            <div className="xl:col-span-2 bg-[#0d1117]/80 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl flex flex-col h-full overflow-hidden">
              {/* Map header */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 z-20 relative" style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <div className="min-w-0 flex items-center gap-3">
                  <Globe className="w-4 h-4 text-primary flex-shrink-0"/>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14px] font-bold text-white tracking-tight">India Global Trade Network</h2>
                      <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${mapIsDemo?"bg-amber-500/12 border-amber-500/30 text-amber-400":"bg-green-500/12 border-green-500/30 text-green-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${mapIsDemo?"bg-amber-400":"bg-green-400"}`}/>
                        {mapIsDemo?"Demo":"Live"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{activeCount} active routes{lastUpdate&&<span> · {lastUpdate.toLocaleTimeString()}</span>}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {(Object.entries(FILTER_CFG) as [FilterMode,typeof FILTER_CFG[FilterMode]][]).map(([mode,cfg])=>{
                    const count=mode==="all"?activeCount:(regionCounts[mode]??0);
                    const isActive=mapFilter===mode;
                    return(
                      <button key={mode} onClick={()=>setMapFilter(mode)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-200"
                        style={{background:isActive?`${cfg.color}15`:"transparent",borderColor:isActive?`${cfg.color}45`:"rgba(255,255,255,0.07)",color:isActive?cfg.color:"#475569",boxShadow:isActive?`0 0 12px ${cfg.color}22`:"none"}}>
                        <span>{cfg.icon}</span>
                        <span className="hidden lg:inline">{mode==="all"?"All":cfg.label}</span>
                        {count>0&&<span className="opacity-60 text-[9px]">{count}</span>}
                      </button>
                    );
                  })}
                  <button onClick={()=>setMapRefresh(n=>n+1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/8 text-slate-500 hover:text-white hover:border-white/20 transition-all duration-200">
                    <RefreshCw className={`w-3.5 h-3.5 ${mapLoading?"animate-spin":""}`}/>
                  </button>
                </div>
              </div>

              {/* Map area */}
              <div className="flex-1 relative overflow-hidden">
                <EmbeddedMap filter={mapFilter} apiRoutes={apiRoutes} isDemo={mapIsDemo}/>
                {mapLoading&&(
                  <div className="absolute inset-0 flex items-center justify-center z-30" style={{background:"rgba(3,8,16,0.55)",backdropFilter:"blur(4px)"}}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin"/>
                      <p className="text-[10px] text-slate-400 font-mono">Loading trade routes…</p>
                    </div>
                  </div>
                )}
                {/* Legend */}
                <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-20">
                  {[{clr:"#fbbf24",label:"India Hubs",dot:false},{clr:"#818cf8",label:"Air Freight",dot:true,dashed:false},{clr:"#67e8f9",label:"Ocean Cargo",dot:true,dashed:true}].map(({clr,label,dot,dashed})=>(
                    <div key={label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-md" style={{background:"rgba(3,8,15,0.85)",border:`1px solid ${clr}22`}}>
                      {dot?(<svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke={clr} strokeWidth="1.5" strokeDasharray={dashed?"5,3":"none"}/><circle cx="13" cy="3" r="1.8" fill={clr}/></svg>):(<span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:clr,boxShadow:`0 0 8px ${clr}`}}/>)}
                      <span className="text-[9px] font-mono" style={{color:clr}}>{label}</span>
                    </div>
                  ))}
                </div>
                {/* Region pills */}
                <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-20">
                  {(["russia","europe","usa","africa","asia"] as FilterMode[]).map(m=>{
                    const cfg=FILTER_CFG[m]; const count=regionCounts[m]??0; if(count===0) return null;
                    const active=mapFilter===m||mapFilter==="all";
                    return(
                      <button key={m} className="flex items-center gap-2 px-2 py-1 rounded-lg backdrop-blur-md transition-all" style={{background:active?`${cfg.color}12`:"rgba(3,8,15,0.7)",border:`1px solid ${active?cfg.color+"28":"rgba(255,255,255,0.04)"}`,opacity:active?1:0.4}} onClick={()=>setMapFilter(mapFilter===m?"all":m)}>
                        <span className="text-[9px]">{cfg.icon}</span>
                        <span className="text-[9px] font-mono" style={{color:active?cfg.color:"#374151"}}>{cfg.label}</span>
                        <span className="text-[10px] font-bold font-mono" style={{color:active?cfg.color:"#1f2937"}}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Map footer */}
              <div className="flex-shrink-0 flex items-center gap-5 px-5 py-2.5 z-20" style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                <div className="flex items-center gap-1.5"><Wind className="w-3 h-3 text-indigo-400"/><span className="text-[10px] text-slate-500">Air</span><span className="text-[10px] font-bold text-indigo-400">{(mapIsDemo?DEMO_ROUTES:apiRoutes).filter(r=>r.type==="air").length}</span></div>
                <div className="flex items-center gap-1.5"><Anchor className="w-3 h-3 text-cyan-400"/><span className="text-[10px] text-slate-500">Ocean</span><span className="text-[10px] font-bold text-cyan-400">{(mapIsDemo?DEMO_ROUTES:apiRoutes).filter(r=>r.type==="ocean").length}</span></div>
                <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-slate-400"/><span className="text-[10px] text-slate-500">Ports</span><span className="text-[10px] font-bold text-slate-300">{new Set((mapIsDemo?DEMO_ROUTES:apiRoutes).flatMap(r=>[r.fromPort,r.toPort])).size}</span></div>
                <div className="ml-auto"><Link href="/dashboard/exporter/shipments" className="flex items-center gap-1 text-[10px] text-primary hover:text-blue-300 font-medium transition-colors">All shipments<ChevronRight className="w-3 h-3"/></Link></div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[15px] font-bold text-white">Recent Transactions</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">{search?`${filteredOrders.length} results`:filteredOrders.length+" orders"}</p>
                </div>
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] text-primary font-bold uppercase tracking-wider">
                  <Activity className="w-2.5 h-2.5"/>Live
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loading?(
                  Array.from({length:4}).map((_,i)=>(
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 animate-pulse">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-slate-700"/><div><div className="w-28 h-3.5 bg-slate-700 rounded mb-1.5"/><div className="w-20 h-2.5 bg-slate-700/50 rounded"/></div></div>
                      <div className="w-14 h-3.5 bg-slate-700 rounded"/>
                    </div>
                  ))
                ):filteredOrders.length===0?(
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"><Activity className="w-5 h-5 text-slate-600"/></div>
                    <p className="text-sm">{search?"No results found":"No transactions yet"}</p>
                  </div>
                ):filteredOrders.map((order,idx)=>{
                  const palette=BG_COLORS[idx%BG_COLORS.length];
                  return(
                    <Link key={order.id} href={`/dashboard/exporter/orders/${order.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200 border border-white/[0.04] hover:border-white/10 cursor-pointer block">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${palette.bg} ${palette.text} flex items-center justify-center font-bold text-xs border border-white/10 flex-shrink-0`}>{getInitials(order.product.name)}</div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{order.product.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{order.importer.companyName||order.importer.name} · {timeAgo(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-bold text-primary">{formatCurrency(order.totalPrice)}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border inline-block mt-0.5 ${STATUS_BG[order.status]||"bg-white/5 border-white/10"} ${STATUS_COLORS[order.status]||"text-slate-400"}`}>{order.status}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link href="/dashboard/exporter/analytics"
                className="mt-4 w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-white/[0.06] hover:border-white/15 flex items-center justify-center gap-1.5">
                View All Transactions<ChevronRight className="w-3.5 h-3.5"/>
              </Link>
            </div>
          </div>

          {/* ── Revenue + Top Buyers ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-6">
            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[15px] font-bold text-white">Revenue by Category</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">{PERIOD_LABELS[period]}</p>
                </div>
                <Link href="/dashboard/exporter/analytics" className="flex items-center gap-1 text-[11px] text-primary hover:text-blue-300 font-medium transition-colors">Details<ChevronRight className="w-3 h-3"/></Link>
              </div>
              <div className="space-y-5">
                {loading?Array.from({length:4}).map((_,i)=>(
                  <div key={i}><div className="flex justify-between mb-2"><div className="w-24 h-3 bg-slate-700 rounded animate-pulse"/><div className="w-16 h-3 bg-slate-700 rounded animate-pulse"/></div><div className="h-2 w-full bg-[#0d1117] rounded-full"/></div>
                )):categories.length===0?(
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-500">
                    <p className="text-sm">No category data yet.</p>
                    <Link href="/dashboard/exporter/inventory?action=add" className="text-xs text-primary hover:underline">Add your first product →</Link>
                  </div>
                ):categories.slice(0,6).map((c)=>{
                  const pct=maxCatRevenue>0?Math.round((c.revenue/maxCatRevenue)*100):0;
                  const colors=CATEGORY_COLORS[c.category]||CATEGORY_COLORS.OTHER;
                  return(
                    <div key={c.category}>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${colors.color}`}/>
                          <span className="text-slate-300 capitalize font-medium">{c.category.toLowerCase().replace(/_/g," ")}</span>
                          <span className="text-slate-600 text-[10px]">{c.orderCount} orders</span>
                        </div>
                        <span className="text-white font-bold">{formatCurrency(c.revenue)}</span>
                      </div>
                      <div className="h-2 w-full bg-[#0d1117] rounded-full overflow-hidden">
                        <div className={`h-full ${colors.color} rounded-full ${colors.shadow} transition-all duration-700`} style={{width:`${Math.max(pct,3)}%`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#151c2a]/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-[15px] font-bold text-white">Top Buyers</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">{search?`Filtered results`:PERIOD_LABELS[period]}</p>
                </div>
                <Link href="/dashboard/exporter/directory" className="flex items-center gap-1 text-[11px] text-primary hover:text-blue-300 font-medium transition-colors">Directory<ChevronRight className="w-3 h-3"/></Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                    <th className="pb-3 font-semibold">Buyer</th><th className="pb-3 font-semibold">Region</th><th className="pb-3 font-semibold">Orders</th><th className="pb-3 font-semibold text-right">Value</th>
                  </tr></thead>
                  <tbody className="text-sm">
                    {loading?Array.from({length:3}).map((_,i)=>(
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3"><div className="w-28 h-4 bg-slate-700 rounded animate-pulse"/></td>
                        <td className="py-3"><div className="w-20 h-4 bg-slate-700/50 rounded animate-pulse"/></td>
                        <td className="py-3"><div className="w-10 h-4 bg-slate-700/50 rounded animate-pulse"/></td>
                        <td className="py-3"><div className="w-16 h-4 bg-slate-700 rounded animate-pulse ml-auto"/></td>
                      </tr>
                    )):filteredPartners.length===0?(
                      <tr><td colSpan={4} className="py-10 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <p className="text-sm">{search?"No buyers match search":"No buyers yet"}</p>
                          {!search&&<Link href="/dashboard/exporter/directory" className="text-xs text-primary hover:underline">Browse directory →</Link>}
                        </div>
                      </td></tr>
                    ):filteredPartners.map((p,idx)=>{
                      const palette=BG_COLORS[idx%BG_COLORS.length];
                      return(
                        <tr key={p.id} className="border-b border-white/[0.04] last:border-0 group hover:bg-white/[0.03] transition-colors cursor-pointer">
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl ${palette.bg} ${palette.text} flex items-center justify-center font-bold text-xs flex-shrink-0`}>{getInitials(p.companyName||p.name)}</div>
                              <div><span className="text-slate-200 font-medium text-sm">{p.companyName||p.name}</span>{p.verified&&<span className="ml-1.5 text-[9px] text-primary">✓</span>}</div>
                            </div>
                          </td>
                          <td className="py-3.5"><span className="text-slate-400 text-xs px-2 py-0.5 rounded-md bg-white/5">{p.country||"—"}</span></td>
                          <td className="py-3.5 text-white font-medium">{formatNumber(p.orderCount)}</td>
                          <td className="py-3.5 text-right"><span className="text-primary font-bold">{formatCurrency(p.totalValue)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}