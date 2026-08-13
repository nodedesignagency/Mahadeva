import { organizationSchema } from "@/config/seo";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { BackgroundTransition } from "@/components/motion/BackgroundTransition";

/**
 * Everything the site wears around a page: the fixed header, the footer, the
 * scroll behaviour and the background that changes under it.
 *
 * A component rather than the root layout, because one part of this app is not
 * the site. The Studio is an editing application served from /studio, and in
 * the root layout it inherited all of this — the header laid over its toolbar,
 * the footer's call-to-action panel under its form, and Lenis intercepting the
 * wheel, which fights the Studio's own scrolling everywhere it has a scrollable
 * panel of its own.
 *
 * So the chrome lives here and is applied by the route group that wants it. It
 * is also used by the 404, which is outside that group but is still the site.
 */

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <BackgroundTransition />
      <SkipLink />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <script
        type="application/ld+json"
        // Static, developer-authored JSON-LD — no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
      />
    </>
  );
}
