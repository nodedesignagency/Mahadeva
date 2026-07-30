import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/config/fonts";
import { baseMetadata, organizationSchema } from "@/config/seo";
import { siteConfig } from "@/config/site.config";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom must stay available; capping it is an accessibility failure.
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#08080b" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.lang} className={fontVariables}>
      <body className="min-h-dvh antialiased">
        {/* Word-reveal headings render transparent and are animated in by JS.
            Without JS they would never become visible, so force them here. */}
        <noscript>
          <style>{`[data-word-reveal]{color:var(--color-fg)!important}`}</style>
        </noscript>
        <SkipLink />
        <Header />
        {/* Footer lands here once its section is built. */}
        <main id="main">{children}</main>
        <script
          type="application/ld+json"
          // Static, developer-authored JSON-LD — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
      </body>
    </html>
  );
}
