import { SiteHeader } from "@/components/layout/SiteHeader.jsx";
import { SiteFooter } from "@/components/layout/SiteFooter.jsx";
import { ScrollProgress, ParallaxOrbs, FloatingActions } from "@/components/layout/ScrollEffects.jsx";
import { SceneLoader } from "@/components/three/SceneLoader.jsx";
export default function SiteLayout({ children }) {
  return (
    <div className="site-depth">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3">Skip to content</a>
      <ScrollProgress />
      <ParallaxOrbs />
      <div aria-hidden className="depth-scene pointer-events-none fixed inset-0 z-0"><SceneLoader variant="compact" className="h-full w-full" /></div>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <FloatingActions />
    </div>
  );
}
