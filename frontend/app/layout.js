import "./globals.css";
import Providers from "@/components/Providers.jsx";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "CareNest — Care Today, Brighter Tomorrows", template: "%s · CareNest" },
  description: "CareNest is a complete digital hospital: verified specialists, modern departments, and seamless online appointments.",
  icons: { icon: "/icon.png" },
  openGraph: {
    type: "website",
    title: "CareNest — Care Today, Brighter Tomorrows",
    description: "Verified specialists, connected departments and seamless hospital appointments.",
    images: [{ url: "/logo.png", width: 900, height: 600, alt: "CareNest" }],
  },
  twitter: { card: "summary", title: "CareNest", description: "A complete digital hospital for connected care." },
};
export const viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#faf7f0" }, { media: "(prefers-color-scheme: dark)", color: "#08130f" }] };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
