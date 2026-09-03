/**
 * Centralised navigation.
 *
 * The header, mobile overlay and footer all render from this one source, so
 * adding a page is a single edit here. Routes and labels match the original
 * template's sitemap.
 */

type NavItem = {
  label: string;
  href: string;
  /** Marks an external destination: rendered with rel/target. */
  external?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

/** Primary header navigation. */
export const mainNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Case Studies", href: "/case-study" },
  { label: "Pricing", href: "/pricing" },
  { label: "Careers", href: "/careers" },
  { label: "Blogs", href: "/blogs" },
];

/** Header call-to-action. */
export const navCta: NavItem = { label: "Contact Us", href: "/contact" };

/**
 * Footer link columns, in the original's three groups. Titles carry their
 * braces: `{NAVIGATION}` is the footer's heading style, not a placeholder.
 *
 * The legal pages sit under Company here rather than in the bottom bar the
 * original puts them in, so this is the only place they are listed.
 */
export const footerNav: NavGroup[] = [
  {
    title: "{Navigation}",
    items: [
      { label: "Home", href: "/" },
      { label: "Pricing", href: "/pricing" },
      { label: "Case Studies", href: "/case-study" },
      { label: "Blog", href: "/blogs" },
      { label: "404", href: "/404" },
    ],
  },
  {
    title: "{Company}",
    items: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/legal-pages/privacy-policy" },
      { label: "Terms of Services", href: "/legal-pages/terms-of-services" },
    ],
  },
  {
    title: "{Follow Us}",
    items: [
      { label: "LinkedIn", href: "https://linkedin.com/", external: true },
      { label: "Instagram", href: "https://instagram.com/", external: true },
      { label: "X/Twitter", href: "https://x.com/", external: true },
    ],
  },
];
