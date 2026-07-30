/**
 * Social links.
 *
 * Remove an entry to drop it from the UI entirely — the footer maps over this
 * list, so no component edit is needed.
 */

import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
  type BrandIcon,
} from "@/components/ui/BrandIcons";

export type SocialLink = {
  label: string;
  href: string;
  icon: BrandIcon;
};

export const socialLinks: SocialLink[] = [
  { label: "X", href: "https://x.com/", icon: XIcon },
  { label: "LinkedIn", href: "https://linkedin.com/", icon: LinkedInIcon },
  { label: "Instagram", href: "https://instagram.com/", icon: InstagramIcon },
  { label: "GitHub", href: "https://github.com/", icon: GitHubIcon },
  { label: "YouTube", href: "https://youtube.com/", icon: YouTubeIcon },
];
