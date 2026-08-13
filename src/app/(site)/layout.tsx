import { SiteChrome } from "@/components/layout/SiteChrome";

/**
 * The site itself — every page a visitor sees.
 *
 * The group exists to draw a line around what wears the site's furniture.
 * /studio is deliberately outside it: an editing application inheriting a fixed
 * header, a call-to-action footer and hijacked scrolling is not usable, and
 * there is no way to opt a route out of a layout except by not being under it.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
