import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/config/fonts";
import { baseMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site.config";
import "./globals.css";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom must stay available; capping it is an accessibility failure.
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#08080b" }],
};

/**
 * The document, and only the document.
 *
 * The header, footer, scroll behaviour and changing background are not here —
 * they are in SiteChrome, applied by the (site) group. /studio sits outside
 * that group precisely so it gets none of them: it is an editing application,
 * not a page of the site, and wearing the site's furniture it was unusable.
 *
 * The fonts and the stylesheet stay, because both halves need them.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.lang} className={fontVariables}>
      <body className="min-h-dvh antialiased">
        {/* Reveal headings render at their pre-reveal colour (transparent) and
            are flipped by JS once the wipe covers them. Without JS they would
            never become visible, so force the final colour here. */}
        <noscript>
          <style>{`[data-reveal-word]{color:var(--color-fg)!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
