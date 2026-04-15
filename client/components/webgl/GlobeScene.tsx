import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, PointMaterial, Points, Float } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";

const THREE_ADDITIVE_BLENDING = 2;
const THREE_BACK_SIDE = 1;

function Globe({ isDark }: { isDark: boolean }) {
 const meshRef = useRef<any>(null);
 const pointsRef = useRef<any>(null);

 const particlesCount = 4000; // Denser network for better visuals
 const positions = useMemo(() => {
 const pos = new Float32Array(particlesCount * 3);
 for (let i = 0; i < particlesCount; i++) {
 const phi = Math.acos(-1 + (2 * i) / particlesCount);
 const theta = Math.sqrt(particlesCount * Math.PI) * phi;
 
 const x = 1.45 * Math.cos(theta) * Math.sin(phi);
 const y = 1.45 * Math.sin(theta) * Math.sin(phi);
 const z = 1.45 * Math.cos(phi);
 
 pos[i * 3] = x;
 pos[i * 3 + 1] = y;
 pos[i * 3 + 2] = z;
 }
 return pos;
 }, []);

 useFrame((state) => {
 const time = state.clock.getElapsedTime();
 if (meshRef.current) {
 meshRef.current.rotation.y = time * 0.05;
 }
 if (pointsRef.current) {
 pointsRef.current.rotation.y = time * 0.04;
 }
 });

 // Dynamic colors based on theme
 const surfaceColor = isDark ? "#0f172a" : "#f1f5f9"; // Slate 900 vs Slate 100
 const nodeColor = isDark ? "#60a5fa" : "#2563eb"; // Blue 400 vs Blue 600
 const innerGlow = isDark ? "#1e40af" : "#93c5fd"; // Blue 800 vs Blue 300
 const atmosphereColor = isDark ? "#3b82f6" : "#cbd5e1"; // Bright Blue vs Slate 300

 return (
 <group>
 {/* Main Globe Sphere */}
 <Sphere ref={meshRef} args={[1.4, 64, 64]}>
 <meshStandardMaterial
 color={surfaceColor}
 roughness={isDark ? 0.4 : 0.6}
 metalness={isDark ? 0.8 : 0.2}
 transparent
 opacity={isDark ? 0.85 : 0.95}
 />
 </Sphere>

 {/* Points Cloud (Network Nodes) */}
 <Points ref={pointsRef} positions={positions}>
 <PointMaterial
 transparent
 color={nodeColor}
 size={0.012}
 sizeAttenuation={true}
 depthWrite={false}
 blending={isDark ? THREE_ADDITIVE_BLENDING : THREE.NormalBlending}
 opacity={isDark ? 1 : 0.7}
 />
 </Points>

 {/* Inner Core Glow */}
 <Sphere args={[1.35, 32, 32]}>
 <meshBasicMaterial 
 color={innerGlow} 
 transparent 
 opacity={isDark ? 0.15 : 0.05} 
 />
 </Sphere>

 {/* Outer Atmosphere Glow */}
 <Sphere args={[1.65, 64, 64]}>
 <meshBasicMaterial
 color={atmosphereColor}
 transparent
 opacity={isDark ? 0.1 : 0.15}
 side={THREE_BACK_SIDE}
 />
 </Sphere>
 </group>
 );
}

export default function GlobeScene() {
 const { resolvedTheme } = useTheme();
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 }, []);

 if (!mounted) return null; // Prevent hydration mismatch

 const isDark = resolvedTheme === "dark";

 return (
 // Transparent wrapper so page bg shows through
 <div className="w-full h-full absolute inset-0 z-0 pointer-events-none">
 <Canvas 
 camera={{ position: [0, 0, 4.5], fov: 45 }} 
 dpr={[1, 2]} // Support retina
 gl={{ antialias: true, alpha: true }} // alpha TRUE is critical for transparency
 >
 <ambientLight intensity={isDark ? 1.5 : 2.5} />
 <pointLight 
 position={[10, 10, 10]} 
 intensity={isDark ? 2 : 1} 
 color={isDark ? "#3b82f6" : "#ffffff"} 
 />
 <spotLight 
 position={[-10, 10, 10]} 
 angle={0.3} 
 penumbra={1} 
 intensity={isDark ? 3 : 1.5} 
 color={isDark ? "#60a5fa" : "#3b82f6"} 
 />
 
 <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
 <Globe isDark={isDark} />
 </Float>
 </Canvas>
 </div>
 );
}
