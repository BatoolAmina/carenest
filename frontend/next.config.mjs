const scriptSrc = process.env.NODE_ENV === "production"
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; frame-src 'self'; img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com; media-src 'self' blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; ${scriptSrc}; connect-src 'self' https://res.cloudinary.com; worker-src 'self' blob:` },
];

export default {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { optimizePackageImports: ["lucide-react", "framer-motion", "@react-three/drei"] },
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }, { protocol: "https", hostname: "images.unsplash.com" }] },
  async rewrites() {
    const backend = process.env.RENDER_API_URL || "http://localhost:3002";
    return [{ source: "/api/:path*", destination: `${backend.replace(/\/$/, "")}/api/:path*` }];
  },
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; },
};
