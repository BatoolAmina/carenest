export function isLowEndDevice(nav = globalThis.navigator) {
  if (!nav) return false;
  const cores = Number(nav.hardwareConcurrency || 8);
  const memory = Number(nav.deviceMemory || 8);
  return cores <= 4 || memory <= 4;
}

export function shouldEnable3D({ reduceMotion, webGLAvailable, lowEnd }) {
  return Boolean(webGLAvailable && !reduceMotion && !lowEnd);
}
