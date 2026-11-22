"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles, Sky, Stars } from "@react-three/drei";
import { useTheme } from "next-themes";

const EMERALD = "#12a077", FOREST = "#0b6b50", GOLD = "#d9b45f", CHAMPAGNE = "#f3e5c2";

/** Double helix (DNA) – two emerald/gold strands joined by rungs, slowly rotating. */
function Helix({ radius = 1.55, height = 6, turns = 2.4, count = 30 }) {
  const group = useRef();
  const data = useMemo(() => {
    const A = [], B = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1), ang = t * turns * Math.PI * 2, y = (t - 0.5) * height;
      A.push(new THREE.Vector3(Math.cos(ang) * radius, y, Math.sin(ang) * radius));
      B.push(new THREE.Vector3(Math.cos(ang + Math.PI) * radius, y, Math.sin(ang + Math.PI) * radius));
    }
    const curve = (pts) => new THREE.CatmullRomCurve3(pts);
    const tube = (pts) => new THREE.TubeGeometry(curve(pts), 160, 0.035, 8, false);
    const up = new THREE.Vector3(0, 1, 0);
    const rungs = A.map((a, i) => { const dir = B[i].clone().sub(a), len = dir.length(); return { pos: a.clone().add(B[i]).multiplyScalar(0.5), len, q: new THREE.Quaternion().setFromUnitVectors(up, dir.normalize()) }; });
    return { A, B, tubeA: tube(A), tubeB: tube(B), rungs };
  }, [radius, height, turns, count]);
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.28; });
  return (
    <group ref={group}>
      <mesh geometry={data.tubeA}><meshStandardMaterial color={EMERALD} emissive={FOREST} emissiveIntensity={0.5} roughness={0.35} metalness={0.2} /></mesh>
      <mesh geometry={data.tubeB}><meshStandardMaterial color={GOLD} emissive="#6b4e12" emissiveIntensity={0.45} roughness={0.28} metalness={0.7} /></mesh>
      {data.A.map((p, i) => (<mesh key={"a" + i} position={p}><sphereGeometry args={[0.1, 20, 20]} /><meshPhysicalMaterial color={EMERALD} emissive={FOREST} emissiveIntensity={0.6} clearcoat={1} roughness={0.15} /></mesh>))}
      {data.B.map((p, i) => (<mesh key={"b" + i} position={p}><sphereGeometry args={[0.1, 20, 20]} /><meshPhysicalMaterial color={GOLD} emissive="#7a5a16" emissiveIntensity={0.5} clearcoat={1} metalness={0.8} roughness={0.2} /></mesh>))}
      {data.rungs.map((r, i) => i % 2 === 0 && (<mesh key={"r" + i} position={r.pos} quaternion={r.q}><cylinderGeometry args={[0.018, 0.018, r.len, 8]} /><meshStandardMaterial color={CHAMPAGNE} emissive={CHAMPAGNE} emissiveIntensity={0.25} roughness={0.4} /></mesh>))}
    </group>
  );
}

/** Glossy emerald medical cross with a gold halo – the brand emblem in 3D. */
function Cross() {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.45;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.35) * 0.12;
    const breathe = 1 + Math.sin(s.clock.elapsedTime * 1.45) * 0.025;
    ref.current.scale.setScalar(breathe);
  });
  const mat = <meshPhysicalMaterial color={EMERALD} emissive={FOREST} emissiveIntensity={0.55} clearcoat={1} clearcoatRoughness={0.08} roughness={0.2} metalness={0.15} />;
  return (
    <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.9}>
      <group ref={ref}>
        <RoundedBox args={[0.62, 1.9, 0.62]} radius={0.16} smoothness={5}>{mat}</RoundedBox>
        <RoundedBox args={[1.9, 0.62, 0.62]} radius={0.16} smoothness={5}>{mat}</RoundedBox>
        <mesh rotation={[Math.PI / 2.4, 0.3, 0]}><torusGeometry args={[1.45, 0.028, 16, 160]} /><meshStandardMaterial color={GOLD} emissive="#8a6a1c" emissiveIntensity={0.7} metalness={0.9} roughness={0.2} /></mesh>
        <mesh rotation={[Math.PI / 1.7, -0.5, 0.4]}><torusGeometry args={[1.2, 0.018, 16, 160]} /><meshStandardMaterial color={CHAMPAGNE} emissive="#b79a52" emissiveIntensity={0.5} metalness={0.85} roughness={0.25} /></mesh>
      </group>
    </Float>
  );
}

/** Drifting orbs for depth. */
function Orbs() {
  const items = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ p: [(Math.sin(i * 2.4) * 3), (Math.cos(i * 1.7) * 2.6), -1.5 - (i % 4) * 0.8], s: 0.1 + (i % 3) * 0.07, gold: i % 2 === 0 })), []);
  return items.map((o, i) => (
    <Float key={i} speed={1 + (i % 3) * 0.5} floatIntensity={1.6} rotationIntensity={0.4}>
      <mesh position={o.p}><sphereGeometry args={[o.s, 24, 24]} /><meshStandardMaterial color={o.gold ? GOLD : EMERALD} emissive={o.gold ? "#8a6a1c" : FOREST} emissiveIntensity={0.7} metalness={0.5} roughness={0.3} /></mesh>
    </Float>
  ));
}

/** A slim medical heartbeat line that carries the visual motion through the scene. */
function HeartbeatRibbon() {
  const group = useRef();
  const geometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 72; i++) {
      const x = (i / 72 - 0.5) * 5.8;
      const segment = (i % 18) - 9;
      let y = 0;
      if (i % 18 === 8) y = 0.7;
      if (i % 18 === 9) y = -0.55;
      if (i % 18 === 10) y = 0.18;
      y += Math.sin(i * 0.22) * 0.08;
      points.push(new THREE.Vector3(x, y - 1.15, -2.05 + Math.sin(segment * 0.18) * 0.12));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 180, 0.018, 8, false);
  }, []);
  useFrame((state) => {
    if (!group.current) return;
    group.current.position.x = Math.sin(state.clock.elapsedTime * 0.32) * 0.12;
  });
  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={GOLD} emissive="#d9b45f" emissiveIntensity={1.2} metalness={0.55} roughness={0.18} />
      </mesh>
    </group>
  );
}

function ScenicGround() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.025;
  });
  return (
    <group position={[0, -3.2, -2.5]} rotation={[-Math.PI / 2.45, 0, 0]}>
      <mesh>
        <circleGeometry args={[9, 96]} />
        <meshBasicMaterial color={FOREST} transparent opacity={0.14} />
      </mesh>
      <group ref={ref}>
        {[1, 2, 3, 4].map((scale, i) => (
          <mesh key={scale} scale={scale * 0.8}>
            <torusGeometry args={[1.8, 0.012, 8, 96]} />
            <meshBasicMaterial color={i % 2 ? GOLD : EMERALD} transparent opacity={0.28 - i * 0.04} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Smooth mouse-driven parallax of the whole scene. */
function Rig({ children, strength, progress }) {
  const g = useRef();
  useFrame((state) => {
    if (!g.current) return;
    const p = progress?.get?.() ?? 0;
    g.current.rotation.y += (state.pointer.x * strength - g.current.rotation.y) * 0.05;
    g.current.rotation.x += (-state.pointer.y * strength * 0.6 - g.current.rotation.x) * 0.05;
    g.current.position.y += ((p - 0.5) * -0.8 - g.current.position.y) * 0.04;
    state.camera.position.z += ((compactCameraZ(state) - p * 0.55) - state.camera.position.z) * 0.04;
  });
  return <group ref={g}>{children}</group>;
}

function compactCameraZ(state) {
  return state.size.width < 700 ? 8.5 : 7.2;
}

export default function Scene({ variant = "hero", active = true, progress = null }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const compact = variant === "compact";
  const sceneRef = useRef(null);
  useEffect(() => () => {
    sceneRef.current?.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
  }, []);
  return (
    <Canvas onCreated={({ scene, gl }) => { sceneRef.current = scene; gl.domElement.setAttribute("aria-hidden", "true"); }} frameloop={active ? "always" : "never"} dpr={compact ? [1, 1.25] : [1, 1.75]} camera={{ position: [0, 0, compact ? 8.5 : 7.2], fov: 38 }} gl={{ alpha: true, antialias: !compact, powerPreference: "high-performance" }} style={{ background: "transparent" }}>
      <color attach="background" args={[dark ? "#071812" : "#b9d9cf"]} />
      <fog attach="fog" args={[dark ? "#071812" : "#b9d9cf", 7, 18]} />
      <Sky distance={450000} sunPosition={[-4, 2, -8]} inclination={0.52} azimuth={0.25} turbidity={8} rayleigh={2.2} mieCoefficient={0.012} mieDirectionalG={0.85} />
      <Stars radius={36} depth={18} count={compact ? 500 : 900} factor={2.2} saturation={0.2} fade speed={0.45} />
      <ambientLight intensity={dark ? 0.55 : 0.8} />
      <directionalLight position={[5, 6, 5]} intensity={dark ? 1.4 : 1.8} color={CHAMPAGNE} />
      <pointLight position={[-5, -2, 4]} intensity={dark ? 40 : 28} color={EMERALD} />
      <pointLight position={[4, -4, -2]} intensity={dark ? 30 : 20} color={GOLD} />
      <Rig strength={0.35} progress={progress}>
        <ScenicGround />
        <Cross />
        <Helix />
        <Orbs />
        <HeartbeatRibbon />
      </Rig>
      <Sparkles count={compact ? 70 : 100} scale={[9, 9, 5]} size={3} speed={0.35} color={GOLD} opacity={0.9} />
    </Canvas>
  );
}
