// Safe upload validation: check size and real file signature (magic bytes), never trust client MIME.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const SIGNATURES = [
  { mime: "application/pdf", ext: "pdf", test: (b) => b.slice(0, 5).toString() === "%PDF-" },
  { mime: "image/png", ext: "png", test: (b) => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/webp", ext: "webp", test: (b) => b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP" },
];
export function detectFileType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  return SIGNATURES.find((s) => s.test(buffer)) || null;
}
export function sanitizeFilename(name = "file") {
  return name.replace(/[^\w.\- ]+/g, "_").replace(/\.{2,}/g, ".").slice(0, 100) || "file";
}
