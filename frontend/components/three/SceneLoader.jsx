"use client";
import { Component, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { HeartPulse } from "lucide-react";
import { isLowEndDevice, shouldEnable3D } from "./capabilities.js";

const Scene = dynamic(() => import("./Scene.jsx"), { ssr: false, loading: () => <StaticArt pulse /> });

/** Elegant non-WebGL fallback (also shown while the 3D bundle loads, for reduced-motion users and unsupported devices). */
export function StaticArt({ pulse }) {
  return (
    <div className={`scene-fallback ${pulse ? "scene-fallback-pulse" : ""}`} role="img" aria-label="CareNest animated scenic background">
      <div className="scene-fallback-sky" />
      <div className="scene-fallback-stars" />
      <div className="scene-fallback-moon" />
      <div className="scene-fallback-horizon" />
      <div className="scene-fallback-rings">
        <span /><span /><span /><span />
      </div>
      <div className="scene-fallback-emblem">
        <HeartPulse className="h-1/2 w-1/2 text-champagne" strokeWidth={1.4} />
      </div>
      <div className="scene-fallback-mist scene-fallback-mist-one" />
      <div className="scene-fallback-mist scene-fallback-mist-two" />
    </div>
  );
}

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {}
  render() { return this.state.failed ? <StaticArt /> : this.props.children; }
}

/** Renders the WebGL scene only when supported, motion is allowed, and the element is on screen (saves battery & GPU). */
export function SceneLoader({ variant = "hero", className = "", progress = null }) {
  const ref = useRef(null);
  const [mode, setMode] = useState("pending");
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const lowEnd = isLowEndDevice(window.navigator);
    let gl = false;
    try { const c = document.createElement("canvas"); gl = !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { /* unsupported */ }
    setMode(shouldEnable3D({ reduceMotion: reduce, webGLAvailable: gl, lowEnd }) ? "3d" : "static");
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} aria-hidden="true">
      {mode === "3d" ? <Boundary><Scene variant={variant} active={visible} progress={progress} /></Boundary> : <StaticArt pulse={mode === "pending"} />}
    </div>
  );
}
