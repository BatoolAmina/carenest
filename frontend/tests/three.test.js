import { describe, expect, it, vi } from "vitest";
import { isLowEndDevice, shouldEnable3D } from "../components/three/capabilities.js";

describe("3D scene capabilities", () => {
  it("disables 3D for reduced motion or low-end devices", () => {
    expect(shouldEnable3D({ reduceMotion: true, webGLAvailable: true, lowEnd: false })).toBe(false);
    expect(shouldEnable3D({ reduceMotion: false, webGLAvailable: true, lowEnd: true })).toBe(false);
  });

  it("enables 3D only with WebGL and capable motion settings", () => {
    expect(shouldEnable3D({ reduceMotion: false, webGLAvailable: true, lowEnd: false })).toBe(true);
  });

  it("detects low-end hardware from navigator hints", () => {
    expect(isLowEndDevice({ hardwareConcurrency: 2, deviceMemory: 2 })).toBe(true);
    expect(isLowEndDevice({ hardwareConcurrency: 12, deviceMemory: 8 })).toBe(false);
  });

  it("supports a mocked WebGL canvas probe", () => {
    vi.stubGlobal("navigator", { hardwareConcurrency: 8, deviceMemory: 8 });
    const context = { isMockContext: true };
    vi.stubGlobal("document", { createElement: () => ({ getContext: () => context }) });
    const canvas = document.createElement("canvas");
    expect(!!(canvas.getContext("webgl2") || canvas.getContext("webgl"))).toBe(true);
    vi.unstubAllGlobals();
  });
});
