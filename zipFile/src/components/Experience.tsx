import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Environment, PerspectiveCamera, Float, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

interface IslandData {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
}

interface RampData {
  position: [number, number, number];
}

interface ExperienceProps {
  data: { islands: IslandData[]; ramps: RampData[] };
  onIslandActive: (island: IslandData | null) => void;
  waveIntensity?: number;
  waveSpeed?: number;
}

const WATER_SIZE = 800;

// Reusable Shared Assets - Pre-allocated to prevent Context Loss & Memory Bloat
const islandGeo = new THREE.CylinderGeometry(5, 6, 2, 8);
const treeGeo = new THREE.ConeGeometry(1.2, 4, 6);
const rampGeo = new THREE.BoxGeometry(10, 4, 15);
const boatHullGeo = new THREE.BoxGeometry(4, 2, 8);
const boatCabinGeo = new THREE.BoxGeometry(3, 2, 3);

// Math Vectors pre-allocated to avoid Garbage Collection (GC) thrashing
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();

function Ocean({ intensity = 0.3, speed = 1.0 }: { intensity: number; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  
  // Custom High-Performance Shader
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uColor: { value: new THREE.Color("#358da1") }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(pos.x * 0.1 + uTime) * uIntensity + cos(pos.y * 0.1 + uTime) * uIntensity;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(uColor + (vUv.y * 0.1), 0.7);
      }
    `
  }), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      timeRef.current += delta * speed;
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = timeRef.current;
      material.uniforms.uIntensity.value = intensity;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
      <planeGeometry args={[WATER_SIZE, WATER_SIZE, 32, 32]} />
      <shaderMaterial args={[shaderArgs]} transparent depthWrite={false} />
    </mesh>
  );
}

function Wake({ parentRef, active }: { parentRef: React.RefObject<THREE.Group>, active: boolean }) {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => Array.from({ length: count }, () => ({
    pos: new THREE.Vector3(),
    life: 0,
    maxLife: 2.0,
    size: 0
  })), [count]);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const spawnTimer = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !parentRef.current) return;

    spawnTimer.current += delta;
    
    if (active && spawnTimer.current > 0.1) {
      spawnTimer.current = 0;
      const p = particles.find(p => p.life <= 0);
      if (p) {
        _v3.set(0, -0.2, -4).applyQuaternion(parentRef.current.quaternion).add(parentRef.current.position);
        p.pos.copy(_v3);
        p.life = p.maxLife;
        p.size = 0.6 + Math.random() * 0.4;
      }
    }

    particles.forEach((p, i) => {
      if (p.life > 0) {
        p.life -= delta;
        const alpha = Math.max(0, p.life / p.maxLife);
        const scale = p.size * (1 + (1 - alpha) * 3);
        
        dummy.position.copy(p.pos);
        dummy.scale.setScalar(scale);
        dummy.rotation.x = -Math.PI / 2;
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <circleGeometry args={[1, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.25} depthWrite={false} />
    </instancedMesh>
  );
}

function Island({ data, onTrigger }: { data: IslandData; onTrigger: (island: IslandData) => void }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={data.position}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh 
          geometry={islandGeo}
          onClick={() => onTrigger(data)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
        >
          <meshStandardMaterial color={hovered ? "#C97850" : "#8BBE8A"} roughness={0.8} />
        </mesh>
        
        <mesh geometry={treeGeo} position={[1, 3, 1]} castShadow>
          <meshStandardMaterial color="#2D5A27" />
        </mesh>

        <Billboard position={[0, 8, 0]}>
          <Text
            fontSize={hovered ? 1.5 : 1.2}
            color="#C97850"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#FBF7F3"
          >
            {data.name.toUpperCase()}
          </Text>
        </Billboard>
      </Float>
    </group>
  );
}

function Boat({ islands, ramps }: { islands: IslandData[]; ramps: RampData[] }) {
  const boatRef = useRef<THREE.Group>(null);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const velocity = useRef(0);
  const rotation = useRef(0);
  const isJumping = useRef(false);

  const islandPosArr = useMemo(() => islands.map(is => new THREE.Vector3(...is.position)), [islands]);
  const rampPosArr = useMemo(() => ramps.map(r => new THREE.Vector3(...r.position)), [ramps]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => setKeys(p => ({ ...p, [e.key.toLowerCase()]: true }));
    const up = (e: KeyboardEvent) => setKeys(p => ({ ...p, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const stunt = () => {
    if (isJumping.current || !boatRef.current) return;
    isJumping.current = true;
    const tl = gsap.timeline({ onComplete: () => { isJumping.current = false; if(boatRef.current) boatRef.current.position.y = 0; }});
    tl.to(boatRef.current.position, { y: 12, duration: 0.5, ease: "power2.out" });
    tl.to(boatRef.current.rotation, { z: Math.PI * 2, duration: 1, ease: "none" }, 0);
    tl.to(boatRef.current.position, { y: 0, duration: 0.5, ease: "bounce.out" });
  };

  useFrame((state, delta) => {
    if (!boatRef.current) return;

    // Movement Physics
    const pushThreshold = (keys['w'] || keys['arrowup']) ? 1 : (keys['s'] || keys['arrowdown']) ? -0.8 : 0;
    const turnThreshold = (keys['a'] || keys['arrowleft']) ? 1 : (keys['d'] || keys['arrowright']) ? -1 : 0;

    velocity.current = THREE.MathUtils.lerp(velocity.current, pushThreshold * 60, delta * 2);
    rotation.current += turnThreshold * 2.5 * delta;
    
    boatRef.current.rotation.y = rotation.current;
    boatRef.current.translateZ(velocity.current * delta);

    // Bound check (Optimized)
    const limit = WATER_SIZE / 2 - 20;
    if (Math.abs(boatRef.current.position.x) > limit) boatRef.current.position.x = Math.sign(boatRef.current.position.x) * limit;
    if (Math.abs(boatRef.current.position.z) > limit) boatRef.current.position.z = Math.sign(boatRef.current.position.z) * limit;

    const bp = boatRef.current.position;
    
    // Slow down near islands
    for(let i=0; i<islandPosArr.length; i++) {
      if (bp.distanceTo(islandPosArr[i]) < 15) velocity.current *= 0.95;
    }

    // Stunt ramp check
    for(let i=0; i<rampPosArr.length; i++) {
        if (bp.distanceTo(rampPosArr[i]) < 12 && !isJumping.current && Math.abs(velocity.current) > 15) stunt();
    }

    // Smooth Camera Follow
    _v1.set(0, 15, -40).applyQuaternion(boatRef.current.quaternion).add(boatRef.current.position);
    state.camera.position.lerp(_v1, 0.08);
    
    _v2.copy(boatRef.current.position).y += 2;
    state.camera.lookAt(_v2);
  });

  return (
    <group ref={boatRef}>
      <Wake parentRef={boatRef} active={Math.abs(velocity.current) > 2 && !isJumping.current} />
      <Float speed={3} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh geometry={boatHullGeo} castShadow>
          <meshStandardMaterial color="#C97850" />
        </mesh>
        <mesh geometry={boatCabinGeo} position={[0, 1.5, -1]} castShadow>
          <meshStandardMaterial color="#FBF7F3" />
        </mesh>
      </Float>
    </group>
  );
}

export default function Experience({ data, onIslandActive }: ExperienceProps) {
  const [waveIntensity, setWaveIntensity] = useState(0.4);
  const [waveSpeed, setWaveSpeed] = useState(1.0);
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="w-full h-full bg-[#fbf7f3]">
      <Canvas 
        shadows
        dpr={1} 
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance", 
          stencil: false, 
          depth: true,
          alpha: false 
        }}
        onCreated={({ gl }) => { 
          // Fix Shadow Deprecation
          gl.shadowMap.type = THREE.PCFShadowMap;
          // Optimization: Pre-compile shaders
          gl.compile(new THREE.Scene(), new THREE.PerspectiveCamera());
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 50, -100]} fov={45} />
        <Sky turbidity={0.01} rayleigh={0.1} sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[50, 100, 50]} 
          intensity={1.0} 
          castShadow 
          shadow-mapSize={[512, 512]} 
        />
        
        <Ocean intensity={waveIntensity} speed={waveSpeed} />
        
        {data.islands.map(is => (
          <Island key={is.id} data={is} onTrigger={onIslandActive} />
        ))}
        
        {data.ramps.map((r, i) => (
          <group key={i} position={r.position} rotation={[0, Math.PI / 4, 0]}>
            <mesh geometry={rampGeo} castShadow>
              <meshStandardMaterial color="#C97850" />
            </mesh>
            <mesh position={[0, 2, 0]} rotation={[-Math.PI / 6, 0, 0]}>
              <planeGeometry args={[10, 18]} />
              <meshStandardMaterial color="#FBF7F3" side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}

        <Boat islands={data.islands} ramps={data.ramps} />
        
        <Environment preset="sunset" />
      </Canvas>

      {/* Wave Controls UI */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {showControls && (
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-terracotta/10 w-64 animate-in slide-in-from-bottom duration-300">
            <h3 className="font-serif text-[#C97850] text-sm mb-4 font-bold uppercase tracking-widest">Seas State</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-bold text-terracotta/60 uppercase">Wave Intensity</label>
                  <span className="text-[10px] font-mono text-terracotta">{waveIntensity.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="2" step="0.05" 
                  value={waveIntensity} 
                  onChange={(e) => setWaveIntensity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-terracotta/10 rounded-lg appearance-none cursor-pointer accent-terracotta"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] font-bold text-terracotta/60 uppercase">Tide Speed</label>
                  <span className="text-[10px] font-mono text-terracotta">{waveSpeed.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="5" step="0.1" 
                  value={waveSpeed} 
                  onChange={(e) => setWaveSpeed(parseFloat(e.target.value))}
                  className="w-full h-1 bg-terracotta/10 rounded-lg appearance-none cursor-pointer accent-terracotta"
                />
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={() => setShowControls(!showControls)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl ${showControls ? 'bg-terracotta text-cream rotate-90' : 'bg-white text-terracotta hover:scale-110'}`}
        >
          <WavesIcon />
        </button>
      </div>

      {/* Controls Legend */}
      <div className="fixed bottom-8 left-8 p-6 bg-white/95 rounded-2xl font-sans shadow-2xl z-40 border-2 border-terracotta/10 pointer-events-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-terracotta rounded-full flex items-center justify-center text-cream">
             <ShipIcon />
          </div>
          <div>
            <h4 className="m-0 text-sm font-bold text-terracotta">NAVIGATOR</h4>
            <p className="m-0 text-[10px] text-terracotta/60 font-bold uppercase tracking-widest">Vessel 03-A</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-8 border-b border-terracotta/5 pb-1">
            <span className="text-[10px] font-bold text-terracotta/60 uppercase">Steer</span>
            <span className="text-xs font-mono font-bold text-terracotta">WASD / ARROWS</span>
          </div>
          <div className="flex justify-between items-center gap-8 border-b border-terracotta/5 pb-1">
            <span className="text-[10px] font-bold text-terracotta/60 uppercase">Flip</span>
            <span className="text-xs font-mono font-bold text-terracotta">RAMP BOOST</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WavesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 6c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  );
}

function ShipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m16 12-4-4-4 4" />
      <path d="M12 16V8" />
    </svg>
  );
}
