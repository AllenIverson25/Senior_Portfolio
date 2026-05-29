import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Environment, PerspectiveCamera, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

interface IslandData {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
}
interface TreasureData {
  id: string;
  position: [number, number, number];
  label: string;
  skinUnlock: string;
}
interface BoatSkin {
  id:    string;
  name:  string;
  hull:  string;
  cabin: string;
  sail:  string;
  mast:  string;
  color: string;
}
interface ExperienceProps {
  data: { islands: IslandData[] };
  onIslandActive: (island: IslandData | null) => void;
}
interface BoatState { x: number; z: number; ry: number; speed: number; }

const WATER_SIZE    = 900;
const PROXIMITY_RANGE = 24;
const TREASURE_RANGE  = 18;

const BOAT_SKINS: BoatSkin[] = [
  { id: 'default',  name: 'Explorer',        hull: '#C97850', cabin: '#FBF7F3', sail: '#FFF8EE', mast: '#6B4226', color: '#C97850' },
  { id: 'crimson',  name: 'Crimson Raider',  hull: '#B83020', cabin: '#F5D0C0', sail: '#FFE8E0', mast: '#5C2218', color: '#B83020' },
  { id: 'midnight', name: 'Midnight Voyager',hull: '#1A2848', cabin: '#2A3C60', sail: '#C8D8FF', mast: '#0D1824', color: '#2A4880' },
  { id: 'golden',   name: 'Golden Galleon',  hull: '#C8A020', cabin: '#FFF5A0', sail: '#FFFBD8', mast: '#786010', color: '#C8A020' },
  { id: 'jade',     name: 'Jade Corsair',    hull: '#1A7860', cabin: '#B0F0D8', sail: '#E0FFF0', mast: '#0A4030', color: '#1A9870' },
  { id: 'ghost',    name: 'Ghost Ship',      hull: '#C8D0E0', cabin: '#F0F4FF', sail: '#E8EEFF', mast: '#9098B0', color: '#B0B8CC' },
  { id: 'obsidian', name: 'Obsidian Drifter',hull: '#2A1540', cabin: '#3A2060', sail: '#C8B8FF', mast: '#150A25', color: '#6040A0' },
  { id: 'admiral', name: 'Admiral',          hull: '#1C3A6E', cabin: '#2A5296', sail: '#F0F8FF', mast: '#0D2040', color: '#1C5AA0' },
];

const TREASURES: TreasureData[] = [
  { id: 't1', position: [135,  0.5,  55],  label: 'Ancient Map Fragment', skinUnlock: 'crimson'  },
  { id: 't2', position: [-115, 0.5, 128],  label: 'Pearl of Wisdom',      skinUnlock: 'midnight' },
  { id: 't3', position: [58,   0.5, -172], label: "Navigator's Compass",  skinUnlock: 'golden'   },
  { id: 't4', position: [-188, 0.5, -68],  label: "Sailor's Lantern",     skinUnlock: 'jade'     },
  { id: 't5', position: [228,  0.5, -95],  label: 'Golden Doubloon',      skinUnlock: 'ghost'    },
  { id: 't6', position: [-38,  0.5, 218],  label: 'Message in a Bottle',  skinUnlock: 'obsidian' },
];

const ISLAND_THEMES: Record<string, { base: string; sand: string; glow: string }> = {
  archives:   { base: '#6B5A3E', sand: '#C4A882', glow: '#D4A854' },
  spotlight:  { base: '#A08020', sand: '#E8C840', glow: '#FFD700' },
  story:      { base: '#8C3E2E', sand: '#C47A62', glow: '#FF8C7A' },
  horizon:    { base: '#2E6E88', sand: '#6EB4CE', glow: '#87CEEB' },
  'ai-logic': { base: '#5850A0', sand: '#A898E8', glow: '#C4B8FF' },
};

// Guided route — the order in which to visit islands
const VISIT_ORDER = ['story', 'spotlight', 'archives', 'ai-logic', 'horizon'];

// Module-level geometry pool
const islandGeo    = new THREE.CylinderGeometry(5, 7, 2.5, 10);
const sandCapGeo   = new THREE.CylinderGeometry(5.1, 5.1, 0.3, 10);
const treeTrunkGeo = new THREE.CylinderGeometry(0.15, 0.22, 2.0, 5);
const treeTopGeo   = new THREE.ConeGeometry(1.5, 3.8, 7);
const rockGeo      = new THREE.DodecahedronGeometry(0.6, 0);
const crystalGeo   = new THREE.OctahedronGeometry(0.75, 0);
const lighthouseGeo= new THREE.CylinderGeometry(0.4, 0.75, 6, 8);
const lightDomeGeo = new THREE.SphereGeometry(0.52, 8, 8);
const glowRingGeo  = new THREE.TorusGeometry(7.5, 0.18, 6, 40);
const mastGeo      = new THREE.CylinderGeometry(0.10, 0.15, 10.0, 8);
const cloudSphGeo  = new THREE.SphereGeometry(1, 6, 5);
const chestBodyGeo = new THREE.BoxGeometry(2.4, 1.5, 1.8);
const chestLidGeo  = new THREE.BoxGeometry(2.4, 0.7, 1.8);
const chestBandGeo = new THREE.BoxGeometry(2.5, 0.18, 0.12);
const tinyGlowGeo  = new THREE.TorusGeometry(2.0, 0.10, 5, 28);

// ── Sailboat hull — lofted cross-section geometry ────────────────────────────
function buildHullGeometry(): THREE.BufferGeometry {
  // Each row: [z, halfBeam, deckY, keelY]
  const secs: [number,number,number,number][] = [
    [  6.0,  0.02,  1.80,  0.55 ],
    [  5.1,  0.55,  1.65, -0.05 ],
    [  3.4,  1.55,  1.48, -0.62 ],
    [  1.3,  2.32,  1.40, -0.74 ],
    [ -1.0,  2.50,  1.40, -0.74 ],
    [ -3.5,  2.28,  1.38, -0.56 ],
    [ -5.4,  2.02,  1.32, -0.14 ],
    [ -6.2,  1.90,  1.28,  0.02 ],
  ];
  const PPS = 5;
  const verts: number[] = [];
  for (const [z,w,dy,ky] of secs) {
    verts.push(-w,       dy,      z);   // 0 port deck
    verts.push(-w*0.88,  ky+0.28, z);   // 1 port bilge
    verts.push( 0,       ky,      z);   // 2 keel
    verts.push( w*0.88,  ky+0.28, z);   // 3 stbd bilge
    verts.push( w,       dy,      z);   // 4 stbd deck
  }
  const idx: number[] = [];
  const n = secs.length;
  for (let i = 0; i < n-1; i++) {
    const a = i*PPS, b = (i+1)*PPS;
    idx.push(a,   b,   b+1, a,   b+1, a+1); // port topsides
    idx.push(a+1, b+1, b+2, a+1, b+2, a+2); // port bilge
    idx.push(a+2, b+2, b+3, a+2, b+3, a+3); // stbd bilge
    idx.push(a+3, b+3, b+4, a+3, b+4, a+4); // stbd topsides
    idx.push(b,   a,   a+4, b,   a+4, b+4); // deck
  }
  const L = (n-1)*PPS;
  idx.push(L,L+2,L+1, L+2,L,L+4, L+2,L+4,L+3); // transom
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}
const sailboatHullGeo = buildHullGeometry();

// Mainsail — tall bermuda triangle
const mainSailShape = new THREE.Shape();
mainSailShape.moveTo(0, 0); mainSailShape.lineTo(0, 9.2); mainSailShape.lineTo(4.8, 0.5); mainSailShape.closePath();
const mainSailGeo = new THREE.ShapeGeometry(mainSailShape);

// Jib — forward foresail
const jibSailShape = new THREE.Shape();
jibSailShape.moveTo(0, 0); jibSailShape.lineTo(0, 6.0); jibSailShape.lineTo(-4.0, 0.3); jibSailShape.closePath();
const jibSailGeo = new THREE.ShapeGeometry(jibSailShape);

const boomGeo2     = new THREE.CylinderGeometry(0.07, 0.10, 5.0, 6);
const bowspritGeo2 = new THREE.CylinderGeometry(0.06, 0.09, 3.2, 6);

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();

// ─── WAVE HEIGHT — shared JS function (mirrors the vertex shader exactly) ─────
// Use this anywhere you need to query water height at a world (x, z) position.
export function getWaveHeight(x: number, z: number, t: number): number {
  return (
    0.28 * Math.sin(( 0.857 * x + 0.514 * z) * 0.10 - t * 0.72) +
    0.18 * Math.sin((-0.447 * x + 0.894 * z) * 0.14 - t * 0.88) +
    0.10 * Math.sin(( 0.316 * x - 0.948 * z) * 0.22 - t * 1.10) +
    0.06 * Math.sin((-0.894 * x - 0.447 * z) * 0.18 - t * 0.95)
  );
}

// ─── WATER shaders ────────────────────────────────────────────────────────────
const WATER_VERT = /* glsl */`
  uniform float uTime;

  varying float vHeight;
  varying vec3  vWorldPos;
  varying vec3  vNormal;

  // 4 low-frequency sine waves — must match getWaveHeight() above exactly
  float waveH(vec2 xz, float t) {
    return
      0.28 * sin(( 0.857 * xz.x + 0.514 * xz.y) * 0.10 - t * 0.72) +
      0.18 * sin((-0.447 * xz.x + 0.894 * xz.y) * 0.14 - t * 0.88) +
      0.10 * sin(( 0.316 * xz.x - 0.948 * xz.y) * 0.22 - t * 1.10) +
      0.06 * sin((-0.894 * xz.x - 0.447 * xz.y) * 0.18 - t * 0.95);
  }

  void main() {
    // World position before displacement
    vec4 world = modelMatrix * vec4(position, 1.0);

    // Displace vertex upward by wave height
    float h = waveH(world.xz, uTime);
    world.y += h;
    vHeight   = h;
    vWorldPos = world.xyz;

    // Analytic surface normal via finite difference
    float eps = 0.6;
    float hX  = waveH(world.xz + vec2(eps, 0.0), uTime);
    float hZ  = waveH(world.xz + vec2(0.0, eps), uTime);
    vNormal   = normalize(vec3((h - hX) / eps, 1.6, (h - hZ) / eps));

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const WATER_FRAG = /* glsl */`
  uniform vec3  uDeepColor;
  uniform vec3  uShallowColor;
  uniform vec3  uSunsetColor;
  uniform vec3  uSunDir;
  uniform vec2  uBoatPos;
  uniform float uBoatSpeed;

  varying float vHeight;
  varying vec3  vWorldPos;
  varying vec3  vNormal;

  void main() {
    vec3  N = normalize(vNormal);
    vec3  V = normalize(cameraPosition - vWorldPos);

    // Fresnel — controls how much sky/sunset we see vs. deep water color
    float NdotV  = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = 0.04 + 0.96 * pow(1.0 - NdotV, 5.0);

    // Base water color: smooth mix from deep navy to teal based on wave height
    float heightT  = clamp(vHeight * 0.55 + 0.5, 0.0, 1.0);
    vec3  waterColor = mix(uDeepColor, uShallowColor, heightT * 0.65);

    // Reflection color: cool sky blue only, no warm sunset tint
    vec3  reflDir   = reflect(-V, N);
    float skyBlend  = clamp(reflDir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3  reflColor = mix(uDeepColor, uShallowColor, skyBlend);

    // Combine water body with reflection via Fresnel
    vec3 color = mix(waterColor, reflColor, fresnel * 0.55);

    // Boat wake — soft white foam ring behind the boat
    float wakeD = length(vWorldPos.xz - uBoatPos);
    float wake  = smoothstep(14.0, 0.5, wakeD) * clamp(uBoatSpeed / 24.0, 0.0, 1.0);
    color = mix(color, vec3(0.88, 0.94, 0.97), wake * 0.28);

    gl_FragColor = vec4(color, 0.92 + fresnel * 0.06);
  }
`;

// ─── WATER component ─────────────────────────────────────────────────────────
function Water({ boatStateRef }: { boatStateRef: React.MutableRefObject<BoatState> }) {
  const uniforms = useMemo(() => ({
    uTime:         { value: 0 },
    uBoatPos:      { value: new THREE.Vector2(0, 0) },
    uBoatSpeed:    { value: 0 },
    uDeepColor:    { value: new THREE.Color('#2A6EA6') },
    uShallowColor: { value: new THREE.Color('#5BAAD4') },
    uSunsetColor:  { value: new THREE.Color('#7BBEDD') },
    uSunDir:       { value: new THREE.Vector3(0.10, 0.65, -1.0).normalize() },
  }), []);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    const bs = boatStateRef.current;
    uniforms.uBoatPos.value.set(bs.x, bs.z);
    uniforms.uBoatSpeed.value = Math.abs(bs.speed);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[WATER_SIZE, WATER_SIZE, 80, 80]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={WATER_VERT}
        fragmentShader={WATER_FRAG}
        transparent
        depthWrite={true}
      />
    </mesh>
  );
}

// ─── DISTANT SUN DISC ─────────────────────────────────────────────────────────
function SunDisc() {
  const coreRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  useFrame((_, delta) => {
    if (!coreRef.current) return;
    t.current += delta;
    (coreRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.90 + Math.sin(t.current * 0.8) * 0.05;
  });
  return (
    <group position={[0, 9, -640]}>
      {/* Wide atmospheric glow */}
      <mesh>
        <circleGeometry args={[55, 40]} />
        <meshBasicMaterial color="#FF2800" transparent opacity={0.05} depthWrite={false} />
      </mesh>
      {/* Near glow */}
      <mesh>
        <circleGeometry args={[28, 40]} />
        <meshBasicMaterial color="#FF5010" transparent opacity={0.10} depthWrite={false} />
      </mesh>
      {/* Sun core — small & crisp */}
      <mesh ref={coreRef}>
        <circleGeometry args={[12, 40]} />
        <meshBasicMaterial color="#FFE060" transparent opacity={0.90} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── FLYING FISH ──────────────────────────────────────────────────────────────
function FlyingFish({ boatStateRef }: { boatStateRef: React.MutableRefObject<BoatState> }) {
  const COUNT = 5;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy   = useMemo(() => new THREE.Object3D(), []);
  const _fDir   = useMemo(() => new THREE.Vector3(), []);
  const _fLook  = useMemo(() => new THREE.Vector3(), []);
  const fish    = useMemo(() => Array.from({ length: COUNT }, () => ({
    active:    false,
    progress:  0,
    duration:  1.0 + Math.random() * 0.6,
    startPos:  new THREE.Vector3(),
    endPos:    new THREE.Vector3(),
    arcHeight: 6 + Math.random() * 6,
    timer:     Math.random() * 4,
    minTimer:  2.5 + Math.random() * 3,
  })), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const bs = boatStateRef.current;
    const moving = Math.abs(bs.speed) > 8;

    fish.forEach((f, i) => {
      if (!f.active) {
        f.timer += delta;
        if (moving && f.timer > f.minTimer) {
          f.timer = 0;
          f.active = true;
          f.progress = 0;
          const angle  = Math.random() * Math.PI * 2;
          const radius = 6 + Math.random() * 14;
          f.startPos.set(
            bs.x + Math.cos(angle) * radius,
            -0.4,
            bs.z + Math.sin(angle) * radius
          );
          const angle2 = angle + (Math.random() - 0.5) * 1.2;
          f.endPos.set(
            f.startPos.x + Math.cos(angle2) * (8 + Math.random() * 10),
            -0.4,
            f.startPos.z + Math.sin(angle2) * (8 + Math.random() * 10)
          );
        }
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      } else {
        f.progress += delta / f.duration;
        if (f.progress >= 1) {
          f.active = false;
          dummy.scale.setScalar(0);
        } else {
          const arc = f.arcHeight * Math.sin(f.progress * Math.PI);
          dummy.position.lerpVectors(f.startPos, f.endPos, f.progress);
          dummy.position.y += arc;
          _fDir.subVectors(f.endPos, f.startPos).normalize();
          _fLook.copy(dummy.position).add(_fDir);
          dummy.lookAt(_fLook);
          dummy.scale.setScalar(1);
        }
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      }
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.25, 0.18, 1.1]} />
      <meshStandardMaterial color="#60C8A0" emissive="#208860" emissiveIntensity={0.3} metalness={0.1} roughness={0.6} />
    </instancedMesh>
  );
}

// ─── ISLAND GLOW RING ─────────────────────────────────────────────────────────
function GlowRing({ color, hovered, visited, isNear }: {
  color: string; hovered: boolean; visited: boolean; isNear: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const t   = useRef(0);
  useFrame((_, delta) => {
    if (!ref.current) return;
    t.current += delta * (isNear ? 4 : 2);
    ref.current.scale.setScalar(isNear ? 1 + Math.sin(t.current) * 0.12 : 1 + Math.sin(t.current) * 0.05);
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = isNear ? 0.9 : hovered ? 0.75 : visited ? 0.55 : 0.25;
    mat.emissiveIntensity = isNear ? 1.8 : hovered ? 1.2 : visited ? 0.6 : 0.25;
  });
  return (
    <mesh ref={ref} geometry={glowRingGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25}
        transparent opacity={0.25} depthWrite={false} />
    </mesh>
  );
}

// ─── BEACON PIN (guided waypoint marker) ──────────────────────────────────────
function BeaconPin({ color }: { color: string }) {
  const pillarRef = useRef<THREE.Mesh>(null);
  const ring1Ref  = useRef<THREE.Mesh>(null);
  const ring2Ref  = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (pillarRef.current) {
      const mat = pillarRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.4 + Math.sin(t.current * 3.0) * 0.7;
      mat.opacity = 0.45 + Math.sin(t.current * 2.0) * 0.15;
    }
    if (ring1Ref.current) {
      ring1Ref.current.scale.setScalar(1 + Math.sin(t.current * 2.2) * 0.18);
      (ring1Ref.current.material as THREE.MeshStandardMaterial).opacity =
        0.55 + Math.sin(t.current * 2.2) * 0.25;
    }
    if (ring2Ref.current) {
      ring2Ref.current.scale.setScalar(1 + Math.sin(t.current * 2.2 + Math.PI) * 0.18);
      (ring2Ref.current.material as THREE.MeshStandardMaterial).opacity =
        0.35 + Math.sin(t.current * 2.2 + Math.PI) * 0.20;
    }
  });

  return (
    <group>
      {/* Light column */}
      <mesh ref={pillarRef} position={[0, 20, 0]}>
        <cylinderGeometry args={[0.18, 0.35, 32, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8}
          transparent opacity={0.50} depthWrite={false} />
      </mesh>
      {/* Top glow sphere */}
      <mesh position={[0, 37, 0]}>
        <sphereGeometry args={[2.2, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4}
          transparent opacity={0.8} depthWrite={false} />
      </mesh>
      {/* Pulsing rings at the top */}
      <mesh ref={ring1Ref} position={[0, 37, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5.5, 0.28, 6, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2}
          transparent opacity={0.6} depthWrite={false} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 37, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[9, 0.18, 6, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6}
          transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Billboard label */}
      <Billboard position={[0, 42, 0]}>
        <Text fontSize={1.6} color={color} anchorX="center" anchorY="middle"
          outlineWidth={0.1} outlineColor="#080820">▼ NEXT STOP</Text>
      </Billboard>
    </group>
  );
}

// ─── TOP NOTCH HUD (unified iPhone-style notch) ───────────────────────────────
function TopNotch({ targetIsland, boatStateRef, visitedCount, totalIslands, collectedCount, totalTreasures }: {
  targetIsland:   IslandData | null;
  boatStateRef:   React.MutableRefObject<BoatState>;
  visitedCount:   number;
  totalIslands:   number;
  collectedCount: number;
  totalTreasures: number;
}) {
  const arrowRef = useRef<HTMLDivElement>(null);
  const distRef  = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!targetIsland) return;
    let id: number;
    const tick = () => {
      const bs = boatStateRef.current;
      const dx = targetIsland.position[0] - bs.x;
      const dz = targetIsland.position[2] - bs.z;
      const worldAngle = Math.atan2(dx, dz);
      const relAngle   = worldAngle - bs.ry;
      const dist       = Math.sqrt(dx * dx + dz * dz);
      if (arrowRef.current) arrowRef.current.style.transform = `rotate(${relAngle * 180 / Math.PI}deg)`;
      if (distRef.current)  distRef.current.textContent = `${Math.round(dist)} nm`;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [targetIsland, boatStateRef]);

  const theme = targetIsland ? (ISLAND_THEMES[targetIsland.id] || { glow: '#C97850' }) : { glow: '#4CAF50' };

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex items-center gap-5 px-8 pt-3 pb-4"
        style={{
          background: 'rgba(4,10,24,0.88)',
          backdropFilter: 'blur(28px)',
          borderRadius: '0 0 28px 28px',
          border: '1px solid rgba(255,255,255,0.09)',
          borderTop: 'none',
          boxShadow: '0 6px 40px rgba(0,0,0,0.6)',
          minWidth: 480,
        }}>

        {/* Navigation section */}
        {targetIsland ? (
          <div className="flex items-center gap-3">
            <div ref={arrowRef} style={{ transformOrigin: 'center', width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="20" viewBox="0 0 16 20"
                style={{ filter: `drop-shadow(0 0 6px ${theme.glow})` }}>
                <polygon points="8,0 16,20 8,14 0,20" fill={theme.glow}/>
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">Sail to</span>
            <span className="text-[15px] font-serif font-semibold"
              style={{ color: theme.glow, textShadow: `0 0 14px ${theme.glow}66` }}>
              {targetIsland.name}
            </span>
            <span ref={distRef} className="text-[11px] font-mono text-white/35">— nm</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="text-[14px]">⚓</span>
            <span className="text-[13px] font-serif font-semibold text-green-400">Voyage Complete!</span>
          </div>
        )}

        <div className="w-px h-5 bg-white/10 flex-shrink-0"/>

        {/* Islands counter */}
        <div className="flex items-center gap-2">
          <span className="text-[13px]">🏝</span>
          <span className="text-[13px] font-mono font-bold text-white/80">
            {visitedCount}<span className="text-white/30">/{totalIslands}</span>
          </span>
        </div>

        <div className="w-px h-5 bg-white/10 flex-shrink-0"/>

        {/* Treasure counter */}
        <div className="flex items-center gap-2">
          <span className="text-[13px]">💰</span>
          <span className="text-[13px] font-mono font-bold text-white/80">
            {collectedCount}<span className="text-white/30">/{totalTreasures}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── DIRECTION ARROW ──────────────────────────────────────────────────────────
function DirectionArrow({ targetIsland, boatStateRef, islandIndex, totalIslands }: {
  targetIsland: IslandData | null;
  boatStateRef: React.MutableRefObject<BoatState>;
  islandIndex:  number;
  totalIslands: number;
}) {
  const arrowWrapRef = useRef<HTMLDivElement>(null);
  const distRef      = useRef<HTMLSpanElement>(null);
  const closeRef     = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!targetIsland) return;
    let id: number;
    const tick = () => {
      const bs  = boatStateRef.current;
      const dx  = targetIsland.position[0] - bs.x;
      const dz  = targetIsland.position[2] - bs.z;
      const worldAngle = Math.atan2(dx, dz);
      const relAngle   = worldAngle - bs.ry;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (arrowWrapRef.current) {
        arrowWrapRef.current.style.transform = `rotate(${relAngle * 180 / Math.PI}deg)`;
      }
      if (distRef.current) {
        distRef.current.textContent = `${Math.round(dist)} nm away`;
      }
      if (closeRef.current) {
        closeRef.current.style.opacity = dist < 60 ? '1' : '0';
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [targetIsland, boatStateRef]);

  if (!targetIsland) return null;
  const theme = ISLAND_THEMES[targetIsland.id] || { glow: '#C97850' };

  return (
    <div className="fixed top-[62px] left-1/2 z-40 pointer-events-none"
      style={{ transform: 'translateX(-50%)' }}>
      <div className="flex items-center gap-3 px-5 py-2 rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: 'rgba(4,12,30,0.88)', backdropFilter: 'blur(18px)' }}>

        {/* Progress pips */}
        <div className="flex gap-1 items-center">
          {Array.from({ length: totalIslands }).map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-500"
              style={{
                width:  i < islandIndex ? 8 : i === islandIndex ? 10 : 5,
                height: i < islandIndex ? 8 : i === islandIndex ? 10 : 5,
                background: i < islandIndex ? '#4CAF50' : i === islandIndex ? theme.glow : 'rgba(255,255,255,0.15)',
                boxShadow:  i === islandIndex ? `0 0 8px ${theme.glow}` : 'none',
              }}/>
          ))}
        </div>

        <div className="w-px h-4 bg-white/10"/>

        {/* Label */}
        <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">Sail to</span>

        {/* Island name */}
        <span className="text-[13px] font-serif font-bold" style={{ color: theme.glow,
          textShadow: `0 0 12px ${theme.glow}60` }}>
          {targetIsland.name}
        </span>

        <div className="w-px h-4 bg-white/10"/>

        {/* Rotating arrow */}
        <div ref={arrowWrapRef} style={{ transformOrigin: 'center', width: 22, height: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="22" viewBox="0 0 18 22"
            style={{ filter: `drop-shadow(0 0 6px ${theme.glow})` }}>
            <polygon points="9,0 18,22 9,15 0,22" fill={theme.glow}/>
          </svg>
        </div>

        {/* Distance */}
        <span ref={distRef} className="text-[11px] font-mono font-bold text-white/60 w-20">— nm away</span>

        {/* "Getting close!" nudge */}
        <span ref={closeRef} className="text-[10px] font-bold text-green-400 transition-opacity duration-500"
          style={{ opacity: 0 }}>
          ⚓ Close!
        </span>
      </div>
    </div>
  );
}

// ─── QUICK NAV ────────────────────────────────────────────────────────────────
function QuickNav({ islands, onOpen }: {
  islands: IslandData[];
  onOpen: (island: IslandData) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-6 right-20 z-50 flex flex-col items-end gap-2.5">
      {open && (
        <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(5,12,28,0.94)',
            backdropFilter: 'blur(20px)',
            width: 248,
            animation: 'fadeSlideDown 0.18s ease',
          }}>
          <div className="px-4 pt-4 pb-3 border-b border-white/8">
            <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#C97850]">Island Directory</p>
            <p className="text-[10px] text-white/30 mt-0.5 font-sans">Browse all island info directly</p>
          </div>
          <div className="p-2 flex flex-col gap-0.5">
            {islands.map(island => {
              const theme = ISLAND_THEMES[island.id] || { glow: '#C97850' };
              return (
                <button key={island.id}
                  onClick={() => { onOpen(island); setOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150 hover:bg-white/6 group">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-150 group-hover:scale-125"
                    style={{ background: theme.glow, boxShadow: `0 0 7px ${theme.glow}` }}/>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/75 group-hover:text-white transition-colors leading-tight">
                      {island.name}
                    </p>
                    <p className="text-[9px] text-white/30 truncate leading-tight mt-0.5">
                      {island.description.slice(0, 42)}…
                    </p>
                  </div>
                  <svg className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" width="10" height="10" viewBox="0 0 10 10">
                    <path d="M3 1l4 4-4 4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </button>
              );
            })}
          </div>
          <div className="px-4 py-2.5 border-t border-white/8">
            <p className="text-[8px] text-white/20 text-center">Works without sailing — jump to any island</p>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        title="Island Directory"
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 border text-base"
        style={{
          background: open
            ? 'linear-gradient(135deg,#C97850,#A04000)'
            : 'rgba(255,255,255,0.07)',
          border: open ? '1px solid rgba(201,120,80,0.6)' : '1px solid rgba(255,255,255,0.12)',
          boxShadow: open ? '0 4px 20px rgba(201,120,80,0.45)' : 'none',
        }}>
        {open ? '✕' : '⊞'}
      </button>
    </div>
  );
}

// ─── ISLAND DECORATIONS ───────────────────────────────────────────────────────
function IslandDecoration({ id }: { id: string }) {
  switch (id) {
    case 'archives':
      return (
        <>
          {([[-1.5,0,-1],[1.3,0.2,0.8],[0.2,0,1.6],[-0.5,0,-2.4],[2.2,0,-0.6]] as [number,number,number][]).map(([x,y,z], i) => (
            <group key={i} position={[x, y+1.5, z]}>
              <mesh geometry={treeTrunkGeo}><meshStandardMaterial color="#5C3D1E" /></mesh>
              <mesh geometry={treeTopGeo} position={[0,1.6,0]}><meshStandardMaterial color={i%2===0?"#2D6A4F":"#1E8449"}/></mesh>
            </group>
          ))}
          {([[-3,0.5,2],[3.5,0.5,-1.2],[-2.2,0.5,2.6]] as [number,number,number][]).map(([x,y,z], i) => (
            <mesh key={i} geometry={rockGeo} position={[x,y,z]} rotation={[i*0.5,i*1.2,i*0.3]}>
              <meshStandardMaterial color="#7F8C8D" roughness={0.9} />
            </mesh>
          ))}
        </>
      );
    case 'spotlight':
      return (
        <>
          <group position={[0,1.5,0]}>
            <mesh geometry={treeTrunkGeo} scale={[1.4,2.8,1.4]}><meshStandardMaterial color="#6E4B1E"/></mesh>
            {([0,60,120,180,240,300] as number[]).map((angle,i)=>(
              <mesh key={i} geometry={treeTopGeo}
                position={[Math.cos(angle*Math.PI/180)*1.6,4.5,Math.sin(angle*Math.PI/180)*1.6]}
                rotation={[0.45,angle*Math.PI/180,0.35]} scale={[0.65,0.65,0.65]}>
                <meshStandardMaterial color="#52B788"/>
              </mesh>
            ))}
          </group>
          <mesh geometry={crystalGeo} position={[2.6,1.8,1.6]} scale={[0.55,1.4,0.55]}>
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} metalness={0.8} roughness={0.1}/>
          </mesh>
          <mesh geometry={crystalGeo} position={[-2.2,1.2,-1.5]} scale={[0.45,1.0,0.45]}>
            <meshStandardMaterial color="#FFC107" emissive="#FFC107" emissiveIntensity={0.4} metalness={0.7} roughness={0.15}/>
          </mesh>
        </>
      );
    case 'story':
      return (
        <>
          {([0,72,144,216,288] as number[]).map((angle,i)=>(
            <mesh key={i} geometry={rockGeo}
              position={[Math.cos(angle*Math.PI/180)*2.2,0.8,Math.sin(angle*Math.PI/180)*2.2]}
              scale={[0.75,0.75,0.75]} rotation={[i*0.4,i*1.1,i*0.6]}>
              <meshStandardMaterial color="#A0522D" roughness={0.92}/>
            </mesh>
          ))}
          <mesh position={[0,1.4,0]}>
            <sphereGeometry args={[0.42,8,8]}/>
            <meshStandardMaterial color="#FF6B35" emissive="#FF4500" emissiveIntensity={1.8}/>
          </mesh>
          {([[-3.2,0,-1.8],[3.1,0,2.1]] as [number,number,number][]).map(([x,_,z],i)=>(
            <group key={i} position={[x,1.5,z]}>
              <mesh geometry={treeTrunkGeo}><meshStandardMaterial color="#5C3D1E"/></mesh>
              <mesh geometry={treeTopGeo} position={[0,1.6,0]}><meshStandardMaterial color="#2D6A4F"/></mesh>
            </group>
          ))}
        </>
      );
    case 'horizon':
      return (
        <>
          <group position={[0,1.5,0]}>
            <mesh geometry={lighthouseGeo}><meshStandardMaterial color="#F0F3F4" roughness={0.25}/></mesh>
            {([-2.2,0,2.2] as number[]).map((y,i)=>(
              <mesh key={i} position={[0,y,0]}>
                <torusGeometry args={[0.76,0.09,6,20]}/>
                <meshStandardMaterial color="#E74C3C"/>
              </mesh>
            ))}
            <mesh geometry={lightDomeGeo} position={[0,3.5,0]}>
              <meshStandardMaterial color="#FFF176" emissive="#FFD700" emissiveIntensity={1.4}/>
            </mesh>
          </group>
          {([[3.2,0.5,-1.8],[-3.6,0.5,1.4]] as [number,number,number][]).map(([x,y,z],i)=>(
            <mesh key={i} geometry={rockGeo} position={[x,y,z]} rotation={[i*0.7,i*1.3,i*0.4]}>
              <meshStandardMaterial color="#5D6D7E" roughness={0.85}/>
            </mesh>
          ))}
        </>
      );
    case 'ai-logic':
      return (
        <>
          {([[0,0,0,0.9,2.1],[2.1,0,1.1,0.65,1.6],[-1.6,0,2.0,0.75,1.9],[1.6,0,-2.2,0.55,1.3],[-2.6,0,-1.1,0.85,1.7]] as [number,number,number,number,number][])
            .map(([x,_,z,sx,sy],i)=>(
              <mesh key={i} geometry={crystalGeo}
                position={[x,sy/1.5,z]} scale={[sx,sy,sx]} rotation={[0.2,i*0.9,0.15]}>
                <meshStandardMaterial color="#A78BFA" emissive="#7C3AED"
                  emissiveIntensity={0.45} metalness={0.3} roughness={0.08} transparent opacity={0.88}/>
              </mesh>
            ))}
        </>
      );
    default: return null;
  }
}

// ─── ISLAND ───────────────────────────────────────────────────────────────────
function Island({ data, onTrigger, visited, isNear, isTarget, isLocked }: {
  data: IslandData; onTrigger:(i:IslandData)=>void; visited:boolean; isNear:boolean; isTarget:boolean; isLocked:boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const theme = ISLAND_THEMES[data.id] || { base:'#6B7C5E', sand:'#9FAF84', glow:'#C97850' };
  const handleClick = useCallback(() => { if (isNear && !isLocked) onTrigger(data); }, [isNear, isLocked, onTrigger, data]);
  return (
    <group position={data.position}>
      <mesh geometry={islandGeo} onClick={handleClick}
        onPointerOver={e=>{e.stopPropagation();if(isNear){setHovered(true);document.body.style.cursor='pointer';}}}
        onPointerOut={()=>{setHovered(false);document.body.style.cursor='default';}}>
        <meshStandardMaterial color={hovered?theme.sand:theme.base} roughness={0.85}/>
      </mesh>
      <mesh geometry={sandCapGeo} position={[0,1.1,0]}>
        <meshStandardMaterial color={hovered?'#EDD9A3':theme.sand} roughness={0.9}/>
      </mesh>
      <IslandDecoration id={data.id}/>
      <GlowRing color={theme.glow} hovered={hovered} visited={visited} isNear={isNear}/>
      {isTarget && !visited && <BeaconPin color={theme.glow}/>}
      <Billboard position={[0,9.5,0]}>
        <Text fontSize={isNear?1.6:1.1} color={isNear?theme.glow:'#FBF7F3'}
          anchorX="center" anchorY="middle" outlineWidth={0.07} outlineColor={isNear?'#1a1a1a':'#2a3a4a'}>
          {data.name.toUpperCase()}
        </Text>
        {visited&&<Text fontSize={0.7} color="#4CAF50" anchorX="center" anchorY="middle"
          position={[0,-1.5,0]} outlineWidth={0.04} outlineColor="#1a1a1a">✓ VISITED</Text>}
        {isNear&&!visited&&!isLocked&&<Text fontSize={0.78} color={theme.glow} anchorX="center" anchorY="middle"
          position={[0,-1.5,0]} outlineWidth={0.05} outlineColor="#1a1a1a">PRESS E TO EXPLORE</Text>}
        {isNear&&!visited&&isLocked&&<Text fontSize={0.70} color="#FF6644" anchorX="center" anchorY="middle"
          position={[0,-1.5,0]} outlineWidth={0.05} outlineColor="#1a1a1a">🔒 VISIT PREVIOUS STOP FIRST</Text>}
        {isNear&&visited&&<Text fontSize={0.68} color="#88CCAA" anchorX="center" anchorY="middle"
          position={[0,-2.4,0]} outlineWidth={0.04} outlineColor="#1a1a1a">PRESS E TO REVISIT</Text>}
      </Billboard>
    </group>
  );
}

// ─── TREASURE CHEST ───────────────────────────────────────────────────────────
function TreasureChest({ data, isNear, collected }: {
  data: TreasureData; isNear: boolean; collected: boolean;
}) {
  const ringRef  = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const t        = useRef(0);

  useFrame((_, delta) => {
    if (!ringRef.current || !groupRef.current) return;
    t.current += delta * (isNear ? 3 : 1.5);
    ringRef.current.scale.setScalar(1 + Math.sin(t.current) * 0.10);
    const mat = ringRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = isNear ? 2.2 : 0.9;
    mat.opacity           = isNear ? 0.95 : 0.55;
    groupRef.current.rotation.y += delta * 0.38;
  });

  if (collected) return null;
  return (
    <group position={data.position}>
        <group ref={groupRef}>
          <mesh geometry={chestBodyGeo} position={[0,0.8,0]}>
            <meshStandardMaterial color="#5C3210" roughness={0.7}/>
          </mesh>
          {[-0.55,0.55].map((z,i)=>(
            <mesh key={i} geometry={chestBandGeo} position={[0,0.8,z]}>
              <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.2}/>
            </mesh>
          ))}
          <mesh geometry={chestLidGeo} position={[0,1.6,0]} rotation={[isNear?-0.45:0,0,0]}>
            <meshStandardMaterial color="#6B3D14" roughness={0.65}/>
          </mesh>
          <mesh position={[0,1.18,0.95]}>
            <boxGeometry args={[0.35,0.35,0.12]}/>
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1.0} metalness={0.9} roughness={0.1}/>
          </mesh>
          <mesh ref={ringRef} geometry={tinyGlowGeo} rotation={[-Math.PI/2,0,0]} position={[0,0.1,0]}>
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.9}
              transparent opacity={0.55} depthWrite={false}/>
          </mesh>
        </group>
      {isNear&&(
        <Billboard position={[0,5.5,0]}>
          <Text fontSize={0.88} color="#FFD700" anchorX="center" anchorY="middle"
            outlineWidth={0.05} outlineColor="#1a1a1a">{data.label.toUpperCase()}</Text>
          <Text fontSize={0.72} color="#FFE880" anchorX="center" anchorY="middle"
            position={[0,-1.4,0]} outlineWidth={0.04} outlineColor="#1a1a1a">PRESS E TO COLLECT</Text>
        </Billboard>
      )}
    </group>
  );
}

// ─── SEAGULLS ─────────────────────────────────────────────────────────────────
const FLOCKS = [
  { center:[0,54,-55]   as [number,number,number], radius:48, speed:0.22, count:3 },
  { center:[-85,48,22]  as [number,number,number], radius:36, speed:0.28, count:2 },
  { center:[65,51,85]   as [number,number,number], radius:42, speed:0.18, count:3 },
];

function Seagulls() {
  const birds = useMemo(()=>FLOCKS.flatMap((f,fi)=>
    Array.from({length:f.count},(_,bi)=>({
      fi, phase:(bi/f.count)*Math.PI*2, altOff:(bi%2===0?1:-1)*2.5
    }))
  ),[]);
  const refs     = useRef<(THREE.Group|null)[]>([]);
  const wingRefs = useRef<(THREE.Group|null)[]>([]);
  const t        = useRef(0);

  useFrame((_,delta)=>{
    t.current += delta;
    birds.forEach((b,i)=>{
      const f = FLOCKS[b.fi];
      const a = t.current*f.speed+b.phase;
      const r = refs.current[i]; if(!r)return;
      r.position.set(
        f.center[0]+Math.cos(a)*f.radius,
        f.center[1]+b.altOff+Math.sin(t.current*0.5+b.phase)*3,
        f.center[2]+Math.sin(a)*f.radius
      );
      r.rotation.y = -a+Math.PI/2;
      const w = wingRefs.current[i]; if(!w)return;
      w.rotation.z = Math.sin(t.current*4.5+b.phase)*0.44;
    });
  });

  return (
    <>
      {birds.map((_,i)=>(
        <group key={i} ref={el=>refs.current[i]=el}>
          <group ref={el=>wingRefs.current[i]=el}>
            <mesh position={[-1.1,0,0]}>
              <boxGeometry args={[2.0,0.07,0.55]}/>
              <meshStandardMaterial color="#EEE6D8" roughness={0.9}/>
            </mesh>
            <mesh position={[1.1,0,0]}>
              <boxGeometry args={[2.0,0.07,0.55]}/>
              <meshStandardMaterial color="#EEE6D8" roughness={0.9}/>
            </mesh>
          </group>
          <mesh><boxGeometry args={[0.5,0.22,0.9]}/><meshStandardMaterial color="#FFFFFF" roughness={0.85}/></mesh>
          <mesh position={[0,0.15,0.5]}><sphereGeometry args={[0.2,6,6]}/><meshStandardMaterial color="#FFFFFF" roughness={0.85}/></mesh>
          <mesh position={[0,0.12,0.72]} rotation={[0.2,0,0]}>
            <coneGeometry args={[0.07,0.25,5]}/><meshStandardMaterial color="#E8A030" roughness={0.6}/>
          </mesh>
        </group>
      ))}
    </>
  );
}

// ─── CLOUDS ───────────────────────────────────────────────────────────────────
const CLOUD_CFGS = [
  {pos:[80,48,60]   as [number,number,number],speed:0.8,offs:[[0,0,0],[2.5,0.8,1.2],[-2,0.5,-1],[4,-0.3,0.8]]},
  {pos:[-110,55,-90]as [number,number,number],speed:0.6,offs:[[0,0,0],[2,0.6,1],[-1.5,0.4,-0.8],[3.2,-0.2,0.5]]},
  {pos:[60,42,-130] as [number,number,number],speed:1.0,offs:[[0,0,0],[2.2,0.7,1.1],[-1.8,0.5,-0.9]]},
  {pos:[-70,52,110] as [number,number,number],speed:0.7,offs:[[0,0,0],[2.4,0.6,1],[-2.2,0.4,-1.2],[3.8,-0.2,0.7]]},
  {pos:[140,44,80]  as [number,number,number],speed:0.5,offs:[[0,0,0],[2.2,0.7,1.0],[-1.6,0.4,-0.7]]},
];

function Clouds() {
  const refs = useRef<(THREE.Group|null)[]>([]);
  const t    = useRef(0);
  useFrame((_,delta)=>{
    t.current+=delta;
    refs.current.forEach((r,i)=>{
      if(!r)return;
      r.position.x=CLOUD_CFGS[i].pos[0]+Math.sin(t.current*CLOUD_CFGS[i].speed*0.1)*18;
    });
  });
  return (
    <>
      {CLOUD_CFGS.map((c,ci)=>(
        <group key={ci} ref={el=>refs.current[ci]=el} position={c.pos}>
          {c.offs.map((o,si)=>(
            <mesh key={si} geometry={cloudSphGeo} position={o as [number,number,number]} scale={[2.4,1.6,2.1]}>
              <meshStandardMaterial color="#FFCC9A" transparent opacity={0.68} roughness={1}/>
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

// ─── ROPE / RIGGING LINE HELPER ────────────────────────────────────────────────
function RopeLine({ from, to, r = 0.035, color }: {
  from: [number,number,number]; to: [number,number,number]; r?: number; color: string;
}) {
  const a   = new THREE.Vector3(...from);
  const b   = new THREE.Vector3(...to);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  const q   = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0,1,0), b.clone().sub(a).normalize()
  );
  return (
    <mesh position={[mid.x, mid.y, mid.z]} quaternion={[q.x,q.y,q.z,q.w]}>
      <cylinderGeometry args={[r, r, len, 4]}/>
      <meshStandardMaterial color={color} roughness={0.7}/>
    </mesh>
  );
}

// ─── BOAT ─────────────────────────────────────────────────────────────────────
function Boat({ islands, treasures, boatStateRef, onNearIsland, onNearTreasure, skin, gameStateRef }: {
  islands:       IslandData[];
  treasures:     TreasureData[];
  boatStateRef:  React.MutableRefObject<BoatState>;
  onNearIsland:  (id:string|null)=>void;
  onNearTreasure:(id:string|null)=>void;
  skin:          BoatSkin;
  gameStateRef:  React.MutableRefObject<{boostCharge:number;boostActive:boolean;speed:number}>;
}) {
  const boatRef  = useRef<THREE.Group>(null);
  const hullRef  = useRef<THREE.Group>(null);
  const keysRef  = useRef<Record<string,boolean>>({});
  const vel      = useRef(0);
  const rot      = useRef(0);
  const tiltZ    = useRef(0);
  const tiltX    = useRef(0);
  const prevVel     = useRef(0);
  const boostCharge = useRef(1.0);
  const lastNear    = useRef<string|null>(null);
  const lastTrNear  = useRef<string|null>(null);

  const islandPos   = useMemo(()=>islands.map(i=>new THREE.Vector3(...i.position)),[islands]);
  const treasurePos = useMemo(()=>treasures.map(t=>new THREE.Vector3(...t.position)),[treasures]);

  useEffect(()=>{
    const dn=(e:KeyboardEvent)=>{keysRef.current[e.key.toLowerCase()]=true;};
    const up=(e:KeyboardEvent)=>{keysRef.current[e.key.toLowerCase()]=false;};
    const clearKeys=()=>{ keysRef.current={}; };
    const onVis=()=>{ if(document.hidden) keysRef.current={}; };
    window.addEventListener('keydown',dn);
    window.addEventListener('keyup',up);
    window.addEventListener('blur',clearKeys);
    document.addEventListener('visibilitychange',onVis);
    return()=>{
      window.removeEventListener('keydown',dn);
      window.removeEventListener('keyup',up);
      window.removeEventListener('blur',clearKeys);
      document.removeEventListener('visibilitychange',onVis);
    };
  },[]);

  useFrame((state,delta)=>{
    delta = Math.min(delta, 0.05);
    if(!boatRef.current||!hullRef.current)return;
    const k=keysRef.current;
    const push=(k['w']||k['arrowup'])?1:(k['s']||k['arrowdown'])?-0.8:0;
    const turn=(k['a']||k['arrowleft'])?1:(k['d']||k['arrowright'])?-1:0;
    const shift=k['shift']||k['shiftleft']||k['shiftright'];
    const boosting=shift&&boostCharge.current>0.05&&push>0;
    boostCharge.current=boosting
      ? Math.max(0,boostCharge.current-delta*0.38)
      : Math.min(1,boostCharge.current+delta*0.15);
    vel.current=THREE.MathUtils.lerp(vel.current,push*60*(boosting?1.7:1),delta*2.2);
    rot.current+=turn*2.5*delta;
    gameStateRef.current.boostCharge=boostCharge.current;
    gameStateRef.current.boostActive=boosting;
    gameStateRef.current.speed=vel.current;
    boatRef.current.rotation.y=rot.current;
    boatRef.current.translateZ(vel.current*delta);
    const limit=WATER_SIZE/2-22;
    boatRef.current.position.x=THREE.MathUtils.clamp(boatRef.current.position.x,-limit,limit);
    boatRef.current.position.z=THREE.MathUtils.clamp(boatRef.current.position.z,-limit,limit);
    const accel=vel.current-prevVel.current;
    prevVel.current=vel.current;
    tiltZ.current=THREE.MathUtils.lerp(tiltZ.current,turn*0.14,delta*3.5);
    tiltX.current=THREE.MathUtils.lerp(tiltX.current,accel*0.0025,delta*3.5);
    hullRef.current.rotation.z=tiltZ.current;
    hullRef.current.rotation.x=tiltX.current;
    const bp=boatRef.current.position;
    for(let i=0;i<islandPos.length;i++){
      if(bp.distanceTo(islandPos[i])<14)vel.current*=0.94;
    }
    let nearId:string|null=null,nearDist=Infinity;
    for(let i=0;i<islandPos.length;i++){
      const d=bp.distanceTo(islandPos[i]);
      if(d<PROXIMITY_RANGE&&d<nearDist){nearDist=d;nearId=islands[i].id;}
    }
    if(nearId!==lastNear.current){lastNear.current=nearId;onNearIsland(nearId);}
    let nearTrId:string|null=null,nearTrDist=Infinity;
    for(let i=0;i<treasurePos.length;i++){
      const d=bp.distanceTo(treasurePos[i]);
      if(d<TREASURE_RANGE&&d<nearTrDist){nearTrDist=d;nearTrId=treasures[i].id;}
    }
    if(nearTrId!==lastTrNear.current){lastTrNear.current=nearTrId;onNearTreasure(nearTrId);}
    _v1.set(0,15,-40).applyQuaternion(boatRef.current.quaternion).add(bp);
    state.camera.position.lerp(_v1,0.08);
    _v2.copy(bp);_v2.y+=2;
    state.camera.lookAt(_v2);
    boatStateRef.current={x:bp.x,z:bp.z,ry:rot.current,speed:vel.current};
  });

  return (
    <group ref={boatRef}>
      <group ref={hullRef}>

        {/* ── HULL ── */}
        <mesh geometry={sailboatHullGeo}>
          <meshStandardMaterial color={skin.hull} roughness={0.28} metalness={0.18} side={THREE.DoubleSide}/>
        </mesh>

        {/* ── DECK ── */}
        <mesh position={[0, 1.42, -0.1]}>
          <boxGeometry args={[4.55, 0.10, 11.8]}/>
          <meshStandardMaterial color={skin.mast} roughness={0.88}/>
        </mesh>

        {/* ── CABIN / WHEELHOUSE ── */}
        <mesh position={[0, 2.22, -0.5]}>
          <boxGeometry args={[2.9, 1.35, 4.4]}/>
          <meshStandardMaterial color={skin.cabin} roughness={0.26} metalness={0.04}/>
        </mesh>
        {/* Slanted windshield */}
        <mesh position={[0, 2.58, 1.76]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[2.75, 1.05, 0.07]}/>
          <meshStandardMaterial color="#88CCEE" transparent opacity={0.55} roughness={0.06}/>
        </mesh>
        {/* Side windows */}
        {([-1.46, 1.46] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 2.28, 0.1]} rotation={[0, Math.PI/2, 0]}>
            <boxGeometry args={[2.6, 0.72, 0.06]}/>
            <meshStandardMaterial color="#88CCEE" transparent opacity={0.45} roughness={0.06}/>
          </mesh>
        ))}
        {/* Cabin roof with slight overhang */}
        <mesh position={[0, 2.97, -0.5]}>
          <boxGeometry args={[3.1, 0.11, 4.7]}/>
          <meshStandardMaterial color={skin.cabin} roughness={0.32}/>
        </mesh>

        {/* ── MAST ── */}
        <mesh geometry={mastGeo} position={[0, 6.4, 1.2]}>
          <meshStandardMaterial color={skin.mast} roughness={0.55} metalness={0.12}/>
        </mesh>
        {/* Mast cap */}
        <mesh position={[0, 11.52, 1.2]}>
          <sphereGeometry args={[0.16, 7, 7]}/>
          <meshStandardMaterial color={skin.mast} metalness={0.45} roughness={0.25}/>
        </mesh>

        {/* ── BOOM (mainsail spar) ── */}
        <RopeLine from={[0, 1.65, 1.2]} to={[0, 1.85, -3.7]} r={0.09} color={skin.mast}/>

        {/* ── BOWSPRIT ── */}
        <mesh geometry={bowspritGeo2} position={[0, 1.60, 7.85]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color={skin.mast} roughness={0.7}/>
        </mesh>

        {/* ── MAINSAIL ── */}
        <mesh geometry={mainSailGeo} position={[0, 1.42, 1.2]} rotation={[0, Math.PI/2, 0]}>
          <meshStandardMaterial color={skin.sail} side={THREE.DoubleSide} roughness={0.22} transparent opacity={0.93}/>
        </mesh>

        {/* ── JIB ── */}
        <mesh geometry={jibSailGeo} position={[0, 1.68, 1.2]} rotation={[0, Math.PI/2, 0]}>
          <meshStandardMaterial color={skin.sail} side={THREE.DoubleSide} roughness={0.22} transparent opacity={0.88}/>
        </mesh>

        {/* ── RIGGING ── */}
        {/* Forestay: mast head → bowsprit tip */}
        <RopeLine from={[0, 11.4, 1.2]} to={[0, 1.65, 9.4]} r={0.028} color={skin.mast}/>
        {/* Backstay: mast head → stern */}
        <RopeLine from={[0, 11.4, 1.2]} to={[0, 1.55, -6.1]} r={0.028} color={skin.mast}/>
        {/* Port shroud */}
        <RopeLine from={[0, 11.4, 1.2]} to={[-2.35, 1.52, -0.8]} r={0.026} color={skin.mast}/>
        {/* Stbd shroud */}
        <RopeLine from={[0, 11.4, 1.2]} to={[ 2.35, 1.52, -0.8]} r={0.026} color={skin.mast}/>
        {/* Boom topping lift */}
        <RopeLine from={[0, 11.4, 1.2]} to={[0, 1.85, -3.7]} r={0.022} color={skin.mast}/>

        {/* ── HULL DETAILS ── */}
        {/* Rudder */}
        <mesh position={[0, 0.05, -6.3]}>
          <boxGeometry args={[0.14, 1.6, 1.05]}/>
          <meshStandardMaterial color={skin.mast} roughness={0.5}/>
        </mesh>
        {/* Port railing */}
        <mesh position={[-2.44, 1.74, -0.4]}>
          <boxGeometry args={[0.06, 0.34, 11.2]}/>
          <meshStandardMaterial color={skin.cabin} roughness={0.5}/>
        </mesh>
        {/* Stbd railing */}
        <mesh position={[2.44, 1.74, -0.4]}>
          <boxGeometry args={[0.06, 0.34, 11.2]}/>
          <meshStandardMaterial color={skin.cabin} roughness={0.5}/>
        </mesh>
        {/* Bow cleat */}
        <mesh position={[0, 1.56, 5.7]}>
          <boxGeometry args={[0.42, 0.22, 0.65]}/>
          <meshStandardMaterial color={skin.mast} metalness={0.55} roughness={0.28}/>
        </mesh>
        {/* Stern cleat */}
        <mesh position={[0, 1.52, -5.9]}>
          <boxGeometry args={[0.42, 0.22, 0.65]}/>
          <meshStandardMaterial color={skin.mast} metalness={0.55} roughness={0.28}/>
        </mesh>
        {/* Flag */}
        <mesh position={[0.55, 11.72, 1.2]}>
          <boxGeometry args={[1.1, 0.52, 0.05]}/>
          <meshStandardMaterial color={skin.hull} side={THREE.DoubleSide} roughness={0.6}/>
        </mesh>

      </group>
    </group>
  );
}

// ─── MINIMAP ──────────────────────────────────────────────────────────────────
function Minimap({ islands, treasures, boatStateRef, visitedIslands, collectedTreasures, targetIslandId }: {
  islands:IslandData[]; treasures:TreasureData[]; boatStateRef:React.MutableRefObject<BoatState>;
  visitedIslands:Set<string>; collectedTreasures:Set<string>; targetIslandId:string|null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const SIZE = 160;
  const HALF = WATER_SIZE / 2;

  useEffect(()=>{
    let id:number;
    const draw=()=>{
      const canvas=canvasRef.current;
      if(!canvas){id=requestAnimationFrame(draw);return;}
      const ctx=canvas.getContext('2d');
      if(!ctx){id=requestAnimationFrame(draw);return;}
      const pulse = (Math.sin(Date.now() / 400) * 0.5 + 0.5); // 0→1 pulsing
      ctx.clearRect(0,0,SIZE,SIZE);
      ctx.save();
      ctx.beginPath();ctx.arc(SIZE/2,SIZE/2,SIZE/2-1,0,Math.PI*2);ctx.clip();
      const bg=ctx.createRadialGradient(SIZE/2,SIZE/2,0,SIZE/2,SIZE/2,SIZE/2);
      bg.addColorStop(0,'#0D2B45');bg.addColorStop(1,'#061828');
      ctx.fillStyle=bg;ctx.fillRect(0,0,SIZE,SIZE);
      ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.lineWidth=1;
      for(let g=1;g<4;g++){
        ctx.beginPath();ctx.moveTo(SIZE/4*g,0);ctx.lineTo(SIZE/4*g,SIZE);ctx.stroke();
        ctx.beginPath();ctx.moveTo(0,SIZE/4*g);ctx.lineTo(SIZE,SIZE/4*g);ctx.stroke();
      }
      const wm=(wx:number,wz:number)=>({
        x:((wx/HALF)+1)*SIZE/2, y:((wz/HALF)+1)*SIZE/2
      });
      treasures.forEach(tr=>{
        if(collectedTreasures.has(tr.id))return;
        const{x,y}=wm(tr.position[0],tr.position[2]);
        ctx.fillStyle='#FFD700';
        ctx.font='9px sans-serif';ctx.textAlign='center';
        ctx.fillText('✦',x,y+3);
      });
      islands.forEach(island=>{
        const{x,y}=wm(island.position[0],island.position[2]);
        const th=ISLAND_THEMES[island.id]||{glow:'#C97850'};
        const isTarget = island.id === targetIslandId;
        // Pulsing outer ring for target island
        if(isTarget){
          const ringR = 14 + pulse * 5;
          ctx.beginPath();ctx.arc(x,y,ringR,0,Math.PI*2);
          ctx.strokeStyle=`rgba(255,255,255,${0.5 + pulse * 0.4})`;
          ctx.lineWidth=1.5;ctx.stroke();
          const tgrd=ctx.createRadialGradient(x,y,0,x,y,16);
          tgrd.addColorStop(0,th.glow+'60');tgrd.addColorStop(1,'transparent');
          ctx.fillStyle=tgrd;ctx.beginPath();ctx.arc(x,y,16,0,Math.PI*2);ctx.fill();
        }
        const grd=ctx.createRadialGradient(x,y,0,x,y,9);
        grd.addColorStop(0,th.glow+'aa');grd.addColorStop(1,'transparent');
        ctx.fillStyle=grd;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=visitedIslands.has(island.id)?'#4CAF50': isTarget ? '#FFFFFF' : th.glow;
        ctx.beginPath();ctx.arc(x,y, isTarget ? 5 : 4,0,Math.PI*2);ctx.fill();
        if(visitedIslands.has(island.id)){
          ctx.strokeStyle='#4CAF50';ctx.lineWidth=1.5;
          ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.stroke();
        }
      });
      const bs=boatStateRef.current;
      const{x:bx,y:by}=wm(bs.x,bs.z);
      ctx.save();ctx.translate(bx,by);ctx.rotate(Math.PI-bs.ry);
      ctx.fillStyle='#FFFFFF';ctx.shadowColor='#FFFFFF';ctx.shadowBlur=4;
      ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(3.5,4.5);ctx.lineTo(0,2);ctx.lineTo(-3.5,4.5);ctx.closePath();
      ctx.fill();ctx.restore();ctx.restore();
      ctx.strokeStyle='rgba(201,120,80,0.7)';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(SIZE/2,SIZE/2,SIZE/2-1,0,Math.PI*2);ctx.stroke();
      id=requestAnimationFrame(draw);
    };
    id=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(id);
  },[islands,treasures,visitedIslands,collectedTreasures]);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-1">
      <canvas ref={canvasRef} width={SIZE} height={SIZE}
        style={{borderRadius:'50%',display:'block',width:SIZE,height:SIZE,flexShrink:0}}/>
      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">NAVIGATOR</span>
    </div>
  );
}

// ─── COMPASS HUD ──────────────────────────────────────────────────────────────
function Compass({ boatStateRef }: { boatStateRef: React.MutableRefObject<BoatState> }) {
  const needleRef = useRef<HTMLDivElement>(null);
  const labelRef  = useRef<HTMLSpanElement>(null);

  useEffect(()=>{
    let id:number;
    const tick=()=>{
      const ry = boatStateRef.current.ry;
      const deg = -(ry * 180 / Math.PI) % 360;
      if(needleRef.current) needleRef.current.style.transform=`rotate(${deg}deg)`;
      if(labelRef.current){
        const norm = ((deg%360)+360)%360;
        const dirs=['N','NE','E','SE','S','SW','W','NW'];
        labelRef.current.textContent = dirs[Math.round(norm/45)%8];
      }
      id=requestAnimationFrame(tick);
    };
    id=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(id);
  },[]);

  return (
    <div className="fixed top-6 right-6 z-40 flex flex-col items-center gap-1">
      <div className="relative w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div ref={needleRef} className="absolute inset-0 flex items-center justify-center"
          style={{transition:'none'}}>
          <div className="w-0.5 h-5 rounded-full" style={{
            background:'linear-gradient(to bottom,#FF4040 50%,#888 50%)',
            transformOrigin:'center center'
          }}/>
        </div>
        {['N','E','S','W'].map((d,i)=>(
          <span key={d} className="absolute text-[7px] font-bold text-white/40"
            style={{
              top:   i===0?'3px':'auto',
              bottom:i===2?'3px':'auto',
              left:  i===3?'3px':'auto',
              right: i===1?'3px':'auto',
            }}>{d}</span>
        ))}
      </div>
      <span ref={labelRef} className="text-[9px] font-bold font-mono text-white/50">N</span>
    </div>
  );
}

// ─── TUTORIAL OVERLAY ─────────────────────────────────────────────────────────
function TutorialOverlay({ onDismiss }: { onDismiss: () => void }) {
  const steps=[
    {icon:'⛵',key:'WASD / ↑↓←→',label:'Steer your boat across the ocean'},
    {icon:'🗺️',key:'Minimap',     label:'Track islands and treasure locations'},
    {icon:'⚓',key:'Press E',     label:'Explore islands when sailing close'},
    {icon:'💰',key:'6 Treasures', label:'Collect chests to unlock new boat skins'},
  ];
  useEffect(()=>{
    const fn=(e:KeyboardEvent)=>{
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))onDismiss();
    };
    const t=setTimeout(onDismiss,10000);
    window.addEventListener('keydown',fn);
    return()=>{clearTimeout(t);window.removeEventListener('keydown',fn);};
  },[onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto mx-4 max-w-lg w-full rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        style={{background:'linear-gradient(135deg,rgba(8,20,42,0.95),rgba(15,35,65,0.95))',backdropFilter:'blur(20px)'}}>
        <div className="px-8 pt-8 pb-2 text-center border-b border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C97850] mb-2">Ocean Expedition</p>
          <h2 className="text-2xl font-serif text-white mb-1">How to Navigate</h2>
          <p className="text-sm text-white/50">Explore islands · Hunt treasure · Unlock boat skins</p>
        </div>
        <div className="px-8 py-6 grid grid-cols-2 gap-4">
          {steps.map(({icon,key,label})=>(
            <div key={key} className="flex gap-3 items-start">
              <span className="text-2xl mt-0.5 leading-none">{icon}</span>
              <div>
                <p className="text-xs font-mono font-bold text-[#C97850] mb-0.5">{key}</p>
                <p className="text-xs text-white/60 leading-relaxed">{label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-8 pb-7 flex justify-center">
          <button onClick={onDismiss} className="px-7 py-2.5 rounded-full text-sm font-bold text-white"
            style={{background:'linear-gradient(135deg,#C97850,#E8A060)'}}>
            Set Sail ⛵
          </button>
        </div>
        <p className="text-center text-[9px] text-white/20 pb-4">Auto-dismisses in 10 s · or press any movement key</p>
      </div>
    </div>
  );
}

// ─── SKIN UNLOCK NOTIFICATION ─────────────────────────────────────────────────
function SkinUnlockNotif({ skin, onDone }: { skin: BoatSkin; onDone: () => void }) {
  useEffect(()=>{const t=setTimeout(onDone,3500);return()=>clearTimeout(t);},[onDone]);
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-yellow-400/30"
        style={{background:'linear-gradient(135deg,rgba(80,50,5,0.94),rgba(130,90,10,0.94))',backdropFilter:'blur(14px)'}}>
        <div className="w-10 h-10 rounded-full border-2 border-yellow-400/60 flex items-center justify-center"
          style={{background:skin.color}}>
          <span className="text-lg">⛵</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-200">Boat Skin Unlocked!</p>
          <p className="text-base font-serif font-bold text-yellow-100">{skin.name}</p>
        </div>
      </div>
    </div>
  );
}

// ─── SKIN SELECTOR ────────────────────────────────────────────────────────────
function SkinSelector({ unlockedIds, activeSkinId, onSelect }: {
  unlockedIds:  Set<string>;
  activeSkinId: string;
  onSelect:     (id:string)=>void;
}) {
  const [open, setOpen] = useState(false);
  const unlockedSkins   = BOAT_SKINS.filter(s=>unlockedIds.has(s.id));
  if(unlockedSkins.length<=1) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open&&(
        <div className="bg-black/65 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/10 w-56">
          <h3 className="text-[#C97850] text-[10px] mb-3 font-bold uppercase tracking-widest">Boat Skins</h3>
          <div className="flex flex-col gap-2">
            {unlockedSkins.map(s=>(
              <button key={s.id} onClick={()=>{onSelect(s.id);setOpen(false);}}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-left
                  ${activeSkinId===s.id?'bg-white/15 ring-1 ring-white/30':'hover:bg-white/8'}`}>
                <div className="w-6 h-6 rounded-full border border-white/20 flex-shrink-0"
                  style={{background:s.color}}/>
                <span className={`text-xs font-medium ${activeSkinId===s.id?'text-white':'text-white/65'}`}>
                  {s.name}
                </span>
                {activeSkinId===s.id&&<span className="ml-auto text-[9px] text-[#C97850] font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(!open)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 border text-lg
          ${open?'bg-[#C97850] border-[#C97850]':'bg-black/40 border-white/10 hover:scale-110 hover:bg-black/60'}`}>
        ⛵
      </button>
    </div>
  );
}

// ─── GAME HUD ─────────────────────────────────────────────────────────────────
function GameHUD({ gameStateRef }: {
  gameStateRef: React.MutableRefObject<{boostCharge:number;boostActive:boolean;speed:number}>;
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const spdRef  = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let id: number;
    const tick = () => {
      const g = gameStateRef.current;
      if (fillRef.current) {
        fillRef.current.style.width = `${g.boostCharge * 100}%`;
        fillRef.current.style.background = g.boostActive ? '#FF7700' : g.boostCharge > 0.25 ? '#C97850' : '#882020';
      }
      if (spdRef.current) {
        spdRef.current.textContent = `${Math.abs(Math.round(g.speed * 0.9))} kn`;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [gameStateRef]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-2">
      <div className="px-4 py-1.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 flex items-center gap-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Speed</span>
        <span ref={spdRef} className="text-sm font-mono font-bold text-white/70 w-14 text-right">0 kn</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Boost</span>
        <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div ref={fillRef} className="h-full rounded-full" style={{width:'100%',background:'#C97850',transition:'none'}}/>
        </div>
        <span className="text-[9px] font-mono text-white/25">SHIFT</span>
      </div>
    </div>
  );
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────
export default function Experience({ data, onIslandActive }: ExperienceProps) {
  const [showTutorial,       setShowTutorial]       = useState(true);
  const [visitedIslands,     setVisitedIslands]     = useState<Set<string>>(new Set());
  const [collectedTreasures, setCollectedTreasures] = useState<Set<string>>(new Set());
  const [voyageComplete,     setVoyageComplete]     = useState(false);
  const [nearIslandId,       setNearIslandId]       = useState<string|null>(null);
  const [nearTreasureId,     setNearTreasureId]     = useState<string|null>(null);
  const [skinNotif,          setSkinNotif]          = useState<BoatSkin|null>(null);
  const [activeSkinId,       setActiveSkinId]       = useState('default');
  const [unlockedSkins,      setUnlockedSkins]      = useState<Set<string>>(new Set(['default']));

  const nearIslandIdRef  = useRef<string|null>(null);
  const nearTreasureRef  = useRef<string|null>(null);
  const boatStateRef     = useRef<BoatState>({x:0,z:0,ry:0,speed:0});
  const gameStateRef     = useRef({boostCharge:1,boostActive:false,speed:0});

  const activeSkin = useMemo(()=>BOAT_SKINS.find(s=>s.id===activeSkinId)||BOAT_SKINS[0],[activeSkinId]);

  const targetIsland = useMemo(()=>{
    for (const id of VISIT_ORDER) {
      if (!visitedIslands.has(id)) return data.islands.find(i => i.id === id) || null;
    }
    return null;
  }, [visitedIslands, data.islands]);

  const handleNearIsland   = useCallback((id:string|null)=>{nearIslandIdRef.current=id;setNearIslandId(id);},[]);
  const handleNearTreasure = useCallback((id:string|null)=>{nearTreasureRef.current=id;setNearTreasureId(id);},[]);

  const targetIslandRef = useRef<IslandData | null>(null);
  useEffect(() => { targetIslandRef.current = targetIsland; }, [targetIsland]);

  const handleIslandTrigger = useCallback((island:IslandData)=>{
    setVisitedIslands(prev=>{
      const next=new Set([...prev,island.id]);
      if(next.size===data.islands.length&&!voyageComplete)setVoyageComplete(true);
      return next;
    });
    onIslandActive(island);
  },[onIslandActive,data.islands.length,voyageComplete]);

  // E key — islands + treasures
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(e.key.toLowerCase()!=='e')return;
      if(nearIslandIdRef.current){
        const island=data.islands.find(i=>i.id===nearIslandIdRef.current);
        const target=targetIslandRef.current;
        // Only allow interaction with the current target island (or if all are visited)
        if(island&&(!target||island.id===target.id))handleIslandTrigger(island);
      }
      if(nearTreasureRef.current){
        const tr=TREASURES.find(t=>t.id===nearTreasureRef.current);
        if(tr&&!collectedTreasures.has(tr.id)){
          setCollectedTreasures(prev=>new Set([...prev,tr.id]));
          const newSkin=BOAT_SKINS.find(s=>s.id===tr.skinUnlock);
          if(newSkin){
            setUnlockedSkins(prev=>new Set([...prev,newSkin.id]));
            setSkinNotif(newSkin);
          }
        }
      }
    };
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[data.islands,handleIslandTrigger,collectedTreasures]);

  const nearIsland   = nearIslandId   ? data.islands.find(i=>i.id===nearIslandId)   : null;
  const nearTreasure = nearTreasureId ? TREASURES.find(t=>t.id===nearTreasureId&&!collectedTreasures.has(t.id)) : null;

  return (
    <div className="w-full h-full bg-[#080E18]">
      {showTutorial&&<TutorialOverlay onDismiss={()=>setShowTutorial(false)}/>}
      {skinNotif&&<SkinUnlockNotif skin={skinNotif} onDone={()=>setSkinNotif(null)}/>}

      <Canvas
        dpr={[1,1]}
        gl={{antialias:false,powerPreference:'high-performance',stencil:false,depth:true,alpha:false}}
      >
        <fogExp2 attach="fog" args={['#08182E',0.00075]}/>
        <PerspectiveCamera makeDefault position={[0,50,-100]} fov={50} near={0.5} far={900}/>

        {/* Deep red/pink sunset lighting */}
        <hemisphereLight args={['#FF4800','#480C70',0.80]}/>
        <ambientLight intensity={0.10} color="#FF7820"/>
        <directionalLight position={[0,6,-220]} intensity={2.0} color="#FF4808"/>
        <directionalLight position={[100,80,80]} intensity={0.20} color="#7744CC"/>

        {/* Dramatic red/pink sky spanning full horizon */}
        <Sky turbidity={5} rayleigh={4.2} sunPosition={[0,1.5,-200]}
          mieCoefficient={0.011} mieDirectionalG={0.93}/>
        <Environment preset="sunset"/>

        <SunDisc/>
        <Water boatStateRef={boatStateRef}/>
        <Clouds/>
        <Seagulls/>

        {data.islands.map(island=>(
          <Island key={island.id} data={island} onTrigger={handleIslandTrigger}
            visited={visitedIslands.has(island.id)} isNear={nearIslandId===island.id}
            isTarget={targetIsland?.id===island.id}
            isLocked={!visitedIslands.has(island.id)&&targetIsland?.id!==island.id&&!!targetIsland}/>
        ))}

        {TREASURES.map(tr=>(
          <TreasureChest key={tr.id} data={tr}
            isNear={nearTreasureId===tr.id}
            collected={collectedTreasures.has(tr.id)}/>
        ))}

        <FlyingFish boatStateRef={boatStateRef}/>

        <Boat
          islands={data.islands}
          treasures={TREASURES}
          boatStateRef={boatStateRef}
          onNearIsland={handleNearIsland}
          onNearTreasure={handleNearTreasure}
          skin={activeSkin}
          gameStateRef={gameStateRef}
        />
      </Canvas>

      <Minimap islands={data.islands} treasures={TREASURES} boatStateRef={boatStateRef}
        visitedIslands={visitedIslands} collectedTreasures={collectedTreasures}
        targetIslandId={targetIsland?.id ?? null}/>

      <Compass boatStateRef={boatStateRef}/>
      <GameHUD gameStateRef={gameStateRef}/>
      <TopNotch
        targetIsland={targetIsland}
        boatStateRef={boatStateRef}
        visitedCount={visitedIslands.size}
        totalIslands={data.islands.length}
        collectedCount={collectedTreasures.size}
        totalTreasures={TREASURES.length}
      />
      <QuickNav islands={data.islands} onOpen={onIslandActive}/>

      {/* Voyage complete banner */}
      {voyageComplete&&(
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-8 py-3 bg-[#C97850] text-white rounded-full shadow-2xl animate-bounce pointer-events-none">
          <span className="font-serif font-bold tracking-wide">⚓ Voyage Complete! All Islands Discovered</span>
        </div>
      )}

      {/* Proximity prompt */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-300"
        style={{opacity:(nearIsland||nearTreasure)?1:0,transform:`translateX(-50%) translateY(${(nearIsland||nearTreasure)?'0px':'12px'})`}}>
        {nearIsland&&(
          <div className="px-6 py-3 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3"
            style={{background:'linear-gradient(135deg,rgba(10,25,50,0.90),rgba(20,45,80,0.90))',backdropFilter:'blur(12px)'}}>
            <kbd className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white/15 text-white border border-white/30">E</kbd>
            <span className="text-sm text-white/90 font-medium">Explore <span className="text-[#C97850] font-bold">{nearIsland.name}</span></span>
          </div>
        )}
        {!nearIsland&&nearTreasure&&(
          <div className="px-6 py-3 rounded-2xl border border-yellow-400/30 shadow-2xl flex items-center gap-3"
            style={{background:'linear-gradient(135deg,rgba(80,50,5,0.90),rgba(120,80,10,0.90))',backdropFilter:'blur(12px)'}}>
            <kbd className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-yellow-400/20 text-yellow-200 border border-yellow-400/30">E</kbd>
            <span className="text-sm text-yellow-100 font-medium">Collect <span className="text-yellow-300 font-bold">{nearTreasure.label}</span></span>
          </div>
        )}
      </div>


      {/* Controls hint */}
      <div className="fixed bottom-6 left-[188px] z-40 pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10 shadow-lg"
          style={{ background: 'rgba(4,12,30,0.80)', backdropFilter: 'blur(14px)' }}>
          {([
            { key: 'W A S D', label: 'Steer' },
            { key: 'SHIFT',   label: 'Boost' },
            { key: 'E',       label: 'Explore' },
          ] as { key: string; label: string }[]).map(({ key, label }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div className="w-px h-3 bg-white/10"/>}
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-white/10 text-white/80 border border-white/15">
                  {key}
                </kbd>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/35">{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Boat skin selector — appears once you've unlocked a skin */}
      <SkinSelector
        unlockedIds={unlockedSkins}
        activeSkinId={activeSkinId}
        onSelect={setActiveSkinId}
      />
    </div>
  );
}
