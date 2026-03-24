import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, PointMaterial, Points, Float } from "@react-three/drei";

// Numerical constants for Three.js to avoid "undefined" errors at runtime
const THREE_ADDITIVE_BLENDING = 2;
const THREE_BACK_SIDE = 1;

function Globe() {
  const meshRef = useRef<any>(null);
  const pointsRef = useRef<any>(null);

  // Create points for a "tech" feel (global trade network nodes)
  const particlesCount = 3000;
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

  return (
    <group>
      {/* Main Globe Sphere (Dark/Glassy) */}
      <Sphere ref={meshRef} args={[1.4, 64, 64]}>
        <meshStandardMaterial
          color="#0a1a3a"
          roughness={0.2}
          metalness={1}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Points Cloud for technical aesthetic (Netwok Nodes) */}
      <Points ref={pointsRef} positions={positions}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.01}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE_ADDITIVE_BLENDING}
        />
      </Points>

      {/* Inner Glow */}
      <Sphere args={[1.35, 32, 32]}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} />
      </Sphere>

      {/* Atmosphere Glow */}
      <Sphere args={[1.6, 64, 64]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.15}
          side={THREE_BACK_SIDE}
        />
      </Sphere>
    </group>
  );
}

export default function GlobeScene() {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-[#020617]">
      <Canvas 
        camera={{ position: [0, 0, 4.2], fov: 40 }} 
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#3b82f6" />
        <spotLight position={[-10, 10, 10]} angle={0.25} penumbra={1} intensity={3} color="#60a5fa" />
        
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <Globe />
        </Float>
      </Canvas>
    </div>
  );
}
