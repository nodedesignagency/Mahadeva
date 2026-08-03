/**
 * Centralised navigation.
 *
 * The header, mobile overlay and footer all render from this one source, so
 * adding a page is a single edit here. Routes and labels match the original
 * template's sitemap.
 */

export type NavItem = {
  label: string;
  href: string;
  /** Marks an external destination: rendered with rel/target. */
  external?: boolean;
};

export type NavGroup = {
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

/** Footer link columns. */
export const footerNav: NavGroup[] = [
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Case Studies", href: "/case-study" },
      { label: "Pricing", href: "/pricing" },
      { label: "Careers", href: "/careers" },
      { label: "Blogs", href: "/blogs" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

/** Legal links, rendered in the footer's bottom bar. */
export const legalNav: NavItem[] = [
  { label: "Privacy Policy", href: "/legal-pages/privacy-policy" },
  { label: "Terms of Services", href: "/legal-pages/terms-of-services" },
];
