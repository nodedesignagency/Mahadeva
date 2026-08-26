import type { StaticImageData } from "next/image";
import brandStandard from "@public/uploads/logos/logo-brand-standard.avif";
import ipsumLogo from "@public/uploads/logos/logo-ipsum-logo.avif";
import lojoIpsum from "@public/uploads/logos/logo-lojo-ipsum.avif";
import logoipsum from "@public/uploads/logos/logo-logoipsum.avif";
import loqo from "@public/uploads/logos/logo-loqo.avif";

/**
 * The client marks, in one place because two rows carry the same five: the
 * trust strip on the home page and the strip under the quote on contact. They
 * are one set of clients, so a mark added here appears in both rather than
 * being wired into each separately.
 *
 * Content names the mark and this says what it is — the same split the tech
 * stack and the principles make, so the lists stay free of imports.
 *
 * They are ink on nothing, and both strips sit on white, so unlike the marks
 * in `SiteIcons` these never have to follow a surface and a file is the right
 * form for them.
 */
export type ClientMark =
  | "ipsumLogo"
  | "loqo"
  | "lojoIpsum"
  | "logoipsum"
  | "brandStandard";

export const clientMarks: Record<ClientMark, StaticImageData> = {
  ipsumLogo,
  loqo,
  lojoIpsum,
  logoipsum,
  brandStandard,
};

/**
 * How tall a mark is drawn. The slot's width and the gap beside it are the
 * marquee's own arithmetic and belong to each strip; the height is what makes
 * the two rows read as the same row, so it lives here with the files.
 */
export const MARK_HEIGHT = "h-6";
