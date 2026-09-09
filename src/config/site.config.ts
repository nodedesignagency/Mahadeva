/**
 * Site-wide configuration.
 *
 * This is the first file a template buyer should open. Name, URL, contact
 * details, default metadata and feature flags all live here — no component
 * reads these values from anywhere else.
 */

export const siteConfig = {
  name: "Mahadeva",
  /** Short label used in the header wordmark and OG images. */
  shortName: "Mahadeva",
  tagline: "AI & automation, built for teams that ship",
  description:
    "Mahadeva is an AI and automation agency template — strategy, custom agents and workflow automation for modern product teams.",

  /**
   * Absolute production URL, no trailing slash. Drives canonical URLs, the
   * sitemap and Open Graph image resolution, so it must be correct before
   * deploying. Override per-environment with NEXT_PUBLIC_SITE_URL.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mahadeva.example.com",

  locale: "en_US",
  /** Used on <html lang>. */
  lang: "en",

  contact: {
    email: "hello@example.com",
    phone: "",
    location: "",
  },


  /** Twitter/X handle including the @, or an empty string to omit the tag. */
  twitterHandle: "",

  /**
   * The floating badge in the bottom right corner.
   *
   * `href` empty draws the badge without making it a link — see BuyTemplate.
   * Set `show` to false to take it off the site entirely.
   */
  template: {
    show: true,
    label: "Launch in hours",
    action: "Buy Template",
    href: "https://contra.com/payment-link/wHlBeqQJ-mahadeva-ai-agency-next-js-template-standard-license",
  },
} as const;
