import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

/**
 * The owner's own marks, inline.
 *
 * Same arrangement as `BrandIcons` and for the same reason: an icon has to be
 * able to take the colour of whatever it sits in, and a file cannot. `<img>`
 * and `next/image` paint an SVG as it was exported — a button arrow fixed at
 * #0E1E1D is wrong on every dark button, and the carousel arrow, exported
 * white, would be invisible on a light one. Inline, the path inherits
 * `currentColor` and the existing `text-*` classes keep working.
 *
 * The exports are the source of truth for these shapes and live at
 * `public/uploads/icons/arrow-button.svg` and `arrow-testimonial.svg`. The
 * paths below are those files with their fixed `fill` swapped for
 * `currentColor` and nothing else touched, so a redraw means re-exporting
 * there and copying the `d` across.
 */

type Icon = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

const base = {
  fill: "currentColor",
  "aria-hidden": true as const,
  focusable: "false" as const,
};

/**
 * The arrow every button carries, and the one in the cut-out box beside a card
 * title. Points up and to the right, with the tail curling back on itself.
 *
 * Drawn on a 16 grid rather than Lucide's 24, so it reads denser than the
 * `ArrowUpRight` it replaces at the same rendered size.
 */
export const ButtonArrow: Icon = (props) => (
  <svg viewBox="0 0 16 16" {...base} {...props}>
    <path d="M12.8737 11.1385C12.8892 11.1385 13.1834 10.9617 13.5285 10.7454C13.8728 10.5297 14.1486 10.3402 14.1401 10.3246C14.1316 10.3091 13.9662 10.0856 13.7724 9.82825C13.3828 9.31135 13.0073 8.62758 12.8411 8.1319C12.3228 6.58687 12.5618 4.98174 13.5016 3.68702L13.7413 3.35681L13.2859 2.90143L12.8298 2.44534L12.5286 2.6603C10.5551 4.06674 8.1898 3.90481 6.09181 2.21978C5.95534 2.11018 5.83796 2.02532 5.8323 2.03098C5.77503 2.08826 5.05802 3.26064 5.05802 3.29599C5.05873 3.32216 5.18388 3.42893 5.33662 3.53217C7.03226 4.68051 8.97115 5.05528 10.4709 4.52282L10.8301 4.39555L5.83018 9.41388L2.6687 12.5867L3.59148 13.5094L6.77275 10.3395L11.7791 5.35155L11.627 5.81471C11.2339 7.01679 11.3944 8.44161 12.0867 9.87775C12.2847 10.2865 12.815 11.1378 12.8737 11.1385Z" />
  </svg>
);

/** The carousel arrow, as drawn: pointing right, tail flaring behind it. */
export const CarouselArrowRight: Icon = (props) => (
  <svg viewBox="0 0 20 20" {...base} {...props}>
    <path d="M11.481 17.7273C11.495 17.7443 11.96 17.8593 12.512 17.9863C13.064 18.1133 13.522 18.1983 13.529 18.1743C13.575 17.8913 13.617 17.6073 13.656 17.3233C13.781 16.4303 14.085 15.3863 14.409 14.7343C15.422 12.7023 17.237 11.3563 19.439 11.0063L20 10.9173V9.12131L19.492 9.03631C16.162 8.47831 13.991 5.98831 13.585 2.26231C13.558 2.01931 13.527 1.82031 13.515 1.82031C13.403 1.82031 11.542 2.26931 11.506 2.30331C11.481 2.33031 11.5 2.55731 11.548 2.81131C12.087 5.61131 13.629 7.89131 15.63 8.84431L16.109 9.07331L6.241 9.09131L0 9.10231V10.9203L6.257 10.9313L16.102 10.9493L15.496 11.2563C13.924 12.0533 12.68 13.6143 11.948 15.7113C11.739 16.3093 11.424 17.6703 11.481 17.7283V17.7273Z" />
  </svg>
);

/**
 * The same arrow mirrored. One file was supplied, not two, because the pair in
 * the design are one shape flipped — doing it here rather than at each call
 * site is what stops the two arrows drifting apart.
 */
export const CarouselArrowLeft: Icon = ({ className, ...props }) => (
  <CarouselArrowRight className={cn("-scale-x-100", className)} {...props} />
);
