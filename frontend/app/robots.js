const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export default function robots() { return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/doctor", "/patient", "/reception"] }], sitemap: `${base}/sitemap.xml` }; }
